package github

import (
	"context"
	"fmt"
	"slices"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	applogger "github.com/andrearcaina/andrearcaina.github.io/internal/logger"
	"golang.org/x/net/html"
	"resty.dev/v3"
)

type Client struct {
	client     *resty.Client
	username   string
	token      string
	cache      *activityCache
	activityMu sync.Mutex
	logger     *applogger.Logger
}

const activityCacheTTL = 10 * time.Minute

const maxPublicPullRequests = 3

func NewClient(username, token string, appLogger *applogger.Logger) *Client {
	if appLogger == nil {
		appLogger = applogger.New()
	}

	return &Client{
		client:   resty.New().SetTimeout(10 * time.Second),
		username: username,
		token:    token,
		cache:    newActivityCache(),
		logger:   appLogger,
	}
}

func (c *Client) RecentRepositories(ctx context.Context, perPage, initialFetch int) ([]Repo, error) {
	var repos []Repo
	response, err := c.client.R().
		SetContext(ctx).
		SetHeader("Accept", "application/vnd.github+json").
		SetQueryParams(map[string]string{
			"sort":      "updated",
			"direction": "desc",
			"per_page":  fmt.Sprintf("%d", initialFetch),
		}).
		SetResult(&repos).
		Get("https://api.github.com/users/" + c.username + "/repos")
	if err != nil {
		return nil, err
	}

	if response.StatusCode() >= 400 {
		return nil, fmt.Errorf("GitHub returned status %d: %s", response.StatusCode(), response.String())
	}

	filtered := repos[:0]
	for _, repo := range repos {
		if !repo.Fork && !repo.Archived && strings.EqualFold(repo.Owner.Login, c.username) && !strings.EqualFold(repo.Name, c.username) {
			filtered = append(filtered, repo)
		}
	}

	priorityNames := []string{"hyperion", "fafnir", "pathfinder", "goforge", "shopecho", "whisp", "vivid", "pyggle"}
	priority := make([]Repo, 0, len(filtered))
	others := make([]Repo, 0, len(filtered))

	for _, repo := range filtered {
		if priorityIndex(repo.Name, priorityNames) >= 0 {
			priority = append(priority, repo)
		} else {
			others = append(others, repo)
		}
	}

	sort.SliceStable(priority, func(i, j int) bool {
		return priorityIndex(priority[i].Name, priorityNames) < priorityIndex(priority[j].Name, priorityNames)
	})
	sort.SliceStable(others, func(i, j int) bool {
		return others[i].PushedAt > others[j].PushedAt
	})

	result := append(priority, others...)
	if perPage < len(result) {
		result = result[:perPage]
	}

	return result, nil
}

func (c *Client) Activity(ctx context.Context) (Activity, error) {
	c.activityMu.Lock()
	defer c.activityMu.Unlock()

	if activity, ok := c.cache.Get(); ok {
		c.logger.Info(ctx, "GitHub activity cache hit", "source", "memory")

		return activity, nil
	}
	c.logger.Info(ctx, "GitHub activity cache miss", "status", "refreshing")

	started := time.Now()
	activity, err := c.fetchActivity(ctx)
	if err != nil {
		c.logger.Error(ctx, "Failed to fetch GitHub activity", "error", err)

		return Activity{}, err
	}

	c.cache.Set(activity)
	c.logger.Info(ctx, "GitHub activity refreshed", "duration", time.Since(started), "pull_requests", len(activity.PullRequests))

	return activity, nil
}

func (c *Client) fetchActivity(ctx context.Context) (Activity, error) {
	calendar, err := c.contributionCalendar(ctx)
	if err != nil {
		return Activity{}, err
	}

	query := `query($login: String!, $after: String) {
  user(login: $login) {
			pullRequests(first: 50, after: $after, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        title
        url
        createdAt
        state
        merged
        isDraft
        repository {
          nameWithOwner
          isPrivate
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`

	pullRequests := make([]PullRequest, 0, maxPublicPullRequests)
	var cursor *string
	for len(pullRequests) < maxPublicPullRequests {
		body := graphqlRequest{
			Query: query,
			Variables: map[string]any{
				"login": c.username,
				"after": cursor,
			},
		}
		var result graphqlResponse
		response, err := c.client.R().
			SetContext(ctx).
			SetHeader("Accept", "application/vnd.github+json").
			SetHeader("Authorization", "Bearer "+c.token).
			SetBody(body).
			SetResult(&result).
			Post("https://api.github.com/graphql")
		if err != nil || response.StatusCode() >= 400 || len(result.Errors) > 0 {
			return calendar, nil
		}

		for _, pullRequest := range result.Data.User.PullRequests.Nodes {
			if pullRequest.Repository.IsPrivate {
				continue
			}
			pullRequests = append(pullRequests, PullRequest{
				Title:      pullRequest.Title,
				URL:        pullRequest.URL,
				Repository: pullRequest.Repository.NameWithOwner,
				OccurredAt: pullRequest.CreatedAt,
				State:      pullRequest.State,
				Merged:     pullRequest.Merged,
				IsDraft:    pullRequest.IsDraft,
			})
			if len(pullRequests) == maxPublicPullRequests {
				break
			}
		}

		if !result.Data.User.PullRequests.PageInfo.HasNextPage {
			break
		}
		nextCursor := result.Data.User.PullRequests.PageInfo.EndCursor
		cursor = &nextCursor
	}
	return Activity{Total: calendar.Total, Days: calendar.Days, PullRequests: pullRequests}, nil
}

func (c *Client) contributionCalendar(ctx context.Context) (Activity, error) {
	response, err := c.client.R().
		SetContext(ctx).
		SetHeader("Accept", "text/html").
		SetHeader("User-Agent", "andrearcaina-site/1.0").
		Get("https://github.com/users/" + c.username + "/contributions")
	if err != nil {
		return Activity{}, err
	}
	if response.StatusCode() >= 400 {
		return Activity{}, fmt.Errorf("GitHub contributions page returned status %d", response.StatusCode())
	}

	document, err := html.Parse(strings.NewReader(response.String()))
	if err != nil {
		return Activity{}, err
	}
	return parseContributionCalendar(document)
}

func parseContributionCalendar(document *html.Node) (Activity, error) {
	tooltips := make(map[string]string)
	var collectTooltips func(*html.Node)
	collectTooltips = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == "tool-tip" {
			if target, ok := attribute(node, "for"); ok {
				tooltips[target] = strings.TrimSpace(textContent(node))
			}
		}
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			collectTooltips(child)
		}
	}
	collectTooltips(document)

	activity := Activity{Days: make([]ActivityDay, 0, 370)}
	var collectDays func(*html.Node)
	collectDays = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == "td" && hasClass(node, "ContributionCalendar-day") {
			date, dateOK := attribute(node, "data-date")
			levelText, levelOK := attribute(node, "data-level")
			cellID, cellIDOK := attribute(node, "id")
			if dateOK && levelOK && cellIDOK {
				level, levelErr := strconv.Atoi(levelText)
				count := contributionCount(tooltips[cellID])
				if levelErr == nil {
					activity.Days = append(activity.Days, ActivityDay{Date: date, Count: count, Level: level})
					activity.Total += count
				}
			}
		}
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			collectDays(child)
		}
	}
	collectDays(document)
	if len(activity.Days) == 0 {
		return Activity{}, fmt.Errorf("GitHub contributions page contained no calendar days")
	}
	sort.Slice(activity.Days, func(i, j int) bool {
		return activity.Days[i].Date < activity.Days[j].Date
	})

	if total, ok := contributionHeaderTotal(document); ok {
		activity.Total = total
	}

	return activity, nil
}

func contributionHeaderTotal(document *html.Node) (int, bool) {
	var total int
	var found bool
	var visit func(*html.Node)
	visit = func(node *html.Node) {
		if found {
			return
		}
		if node.Type == html.ElementNode && node.Data == "h2" {
			if id, ok := attribute(node, "id"); ok && id == "js-contribution-activity-description" {
				fields := strings.Fields(textContent(node))
				if len(fields) > 0 {
					parsed, err := strconv.Atoi(strings.ReplaceAll(fields[0], ",", ""))
					if err == nil {
						returnValue := parsed
						total = returnValue
						found = true
					}
				}
			}
		}
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			visit(child)
		}
	}
	visit(document)
	return total, found
}

func attribute(node *html.Node, name string) (string, bool) {
	for _, attr := range node.Attr {
		if attr.Key == name {
			return attr.Val, true
		}
	}
	return "", false
}

func hasClass(node *html.Node, className string) bool {
	classes, ok := attribute(node, "class")
	if !ok {
		return false
	}
	return slices.Contains(strings.Fields(classes), className)
}

func textContent(node *html.Node) string {
	if node.Type == html.TextNode {
		return node.Data
	}
	var builder strings.Builder
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		builder.WriteString(textContent(child))
	}
	return builder.String()
}

func contributionCount(label string) int {
	fields := strings.Fields(label)
	if len(fields) == 0 || fields[0] == "No" {
		return 0
	}
	count, err := strconv.Atoi(fields[0])
	if err != nil {
		return 0
	}
	return count
}

func priorityIndex(name string, priorities []string) int {
	name = strings.ToLower(name)
	for index, priority := range priorities {
		if strings.Contains(name, priority) {
			return index
		}
	}

	return -1
}
