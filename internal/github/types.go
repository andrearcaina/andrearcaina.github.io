package github

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
