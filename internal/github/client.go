package github

import (
	"context"
	"fmt"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"golang.org/x/net/html"
	"resty.dev/v3"
)

type Repo struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	HTMLURL     string   `json:"html_url"`
	Homepage    *string  `json:"homepage"`
	Description *string  `json:"description"`
	Stars       int      `json:"stargazers_count"`
	Forks       int      `json:"forks_count"`
	Watchers    int      `json:"watchers_count"`
	Language    *string  `json:"language"`
	PushedAt    string   `json:"pushed_at"`
	Archived    bool     `json:"archived"`
	Fork        bool     `json:"fork"`
	Owner       Owner    `json:"owner"`
	Topics      []string `json:"topics"`
}

type Owner struct {
	Login string `json:"login"`
}

type ActivityDay struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
	Level int    `json:"level"`
}

type Activity struct {
	Total        int           `json:"total"`
	Days         []ActivityDay `json:"days"`
	PullRequests []PullRequest `json:"pullRequests"`
}

type PullRequest struct {
	Title      string `json:"title"`
	URL        string `json:"url"`
	Repository string `json:"repository"`
	OccurredAt string `json:"occurredAt"`
	State      string `json:"state"`
	Merged     bool   `json:"merged"`
	IsDraft    bool   `json:"isDraft"`
}

type graphqlRequest struct {
	Query     string            `json:"query"`
	Variables map[string]string `json:"variables"`
}

type graphqlResponse struct {
	Data struct {
		User struct {
			PullRequests struct {
				Nodes []struct {
					Title      string `json:"title"`
					URL        string `json:"url"`
					CreatedAt  string `json:"createdAt"`
					State      string `json:"state"`
					Merged     bool   `json:"merged"`
					IsDraft    bool   `json:"isDraft"`
					Repository struct {
						NameWithOwner string `json:"nameWithOwner"`
						IsPrivate     bool   `json:"isPrivate"`
					} `json:"repository"`
				} `json:"nodes"`
			} `json:"pullRequests"`
		} `json:"user"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

type Client struct {
	client   *resty.Client
	username string
	token    string
}

func NewClient(username, token string) *Client {
	return &Client{
		client:   resty.New().SetTimeout(10 * time.Second),
		username: username,
		token:    token,
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
	calendar, err := c.contributionCalendar(ctx)
	if err != nil {
		return Activity{}, err
	}

	query := `query($login: String!) {
  user(login: $login) {
    pullRequests(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
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
    }
  }
}`
	body := graphqlRequest{
		Query: query,
		Variables: map[string]string{
			"login": c.username,
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
	if err != nil {
		return calendar, nil
	}
	if response.StatusCode() >= 400 {
		return calendar, nil
	}
	if len(result.Errors) > 0 {
		return calendar, nil
	}

	pullRequests := make([]PullRequest, 0, len(result.Data.User.PullRequests.Nodes))
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
