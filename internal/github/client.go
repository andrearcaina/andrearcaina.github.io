package github

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

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
}

type graphqlRequest struct {
	Query     string            `json:"query"`
	Variables map[string]string `json:"variables"`
}

type graphqlResponse struct {
	Data struct {
		User struct {
			Contributions struct {
				Calendar struct {
					Total int `json:"totalContributions"`
					Weeks []struct {
						Days []struct {
							Date  string `json:"date"`
							Count int    `json:"contributionCount"`
							Level string `json:"contributionLevel"`
						} `json:"contributionDays"`
					} `json:"weeks"`
				} `json:"contributionCalendar"`
				PullRequests struct {
					Nodes []struct {
						OccurredAt  string `json:"occurredAt"`
						PullRequest struct {
							Title      string `json:"title"`
							URL        string `json:"url"`
							Repository struct {
								NameWithOwner string `json:"nameWithOwner"`
								IsPrivate     bool   `json:"isPrivate"`
							} `json:"repository"`
						} `json:"pullRequest"`
					} `json:"nodes"`
				} `json:"pullRequestContributions"`
			} `json:"contributionsCollection"`
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
	if c.token == "" {
		return Activity{}, fmt.Errorf("GitHub GraphQL token is not configured")
	}

	query := `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
      pullRequestContributions(first: 10) {
        nodes {
          occurredAt
          pullRequest {
            title
            url
            repository {
              nameWithOwner
              isPrivate
            }
          }
        }
      }
    }
  }
}`
	now := time.Now().UTC()
	body := graphqlRequest{
		Query: query,
		Variables: map[string]string{
			"login": c.username,
			"from":  now.AddDate(-1, 0, 0).Format(time.RFC3339),
			"to":    now.Format(time.RFC3339),
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
		return Activity{}, err
	}
	if response.StatusCode() >= 400 {
		return Activity{}, fmt.Errorf("GitHub GraphQL returned status %d: %s", response.StatusCode(), response.String())
	}
	if len(result.Errors) > 0 {
		return Activity{}, fmt.Errorf("GitHub GraphQL error: %s", result.Errors[0].Message)
	}

	calendar := result.Data.User.Contributions.Calendar
	days := make([]ActivityDay, 0, 370)
	for _, week := range calendar.Weeks {
		for _, day := range week.Days {
			days = append(days, ActivityDay{Date: day.Date, Count: day.Count, Level: contributionLevel(day.Level)})
		}
	}
	pullRequests := make([]PullRequest, 0, len(result.Data.User.Contributions.PullRequests.Nodes))
	for _, contribution := range result.Data.User.Contributions.PullRequests.Nodes {
		if contribution.PullRequest.Repository.IsPrivate {
			continue
		}
		pullRequests = append(pullRequests, PullRequest{
			Title:      contribution.PullRequest.Title,
			URL:        contribution.PullRequest.URL,
			Repository: contribution.PullRequest.Repository.NameWithOwner,
			OccurredAt: contribution.OccurredAt,
		})
	}
	if len(days) == 0 {
		return Activity{}, fmt.Errorf("GitHub GraphQL contribution calendar contained no days")
	}
	return Activity{Total: calendar.Total, Days: days, PullRequests: pullRequests}, nil
}

func contributionLevel(level string) int {
	switch level {
	case "FIRST_QUARTILE":
		return 1
	case "SECOND_QUARTILE":
		return 2
	case "THIRD_QUARTILE":
		return 3
	case "FOURTH_QUARTILE":
		return 4
	default:
		return 0
	}
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
