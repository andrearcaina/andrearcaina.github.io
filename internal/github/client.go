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

type Client struct {
	client   *resty.Client
	username string
}

func NewClient(username string) *Client {
	return &Client{
		client:   resty.New().SetTimeout(10 * time.Second),
		username: username,
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

	priorityNames := []string{"fafnir", "hyperion", "pathfinder", "goforge", "shopecho", "whisp", "vivid", "pyggle"}
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

func priorityIndex(name string, priorities []string) int {
	name = strings.ToLower(name)
	for index, priority := range priorities {
		if strings.Contains(name, priority) {
			return index
		}
	}

	return -1
}
