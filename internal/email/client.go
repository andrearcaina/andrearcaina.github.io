package email

import (
	"context"
	"fmt"
	"time"

	"resty.dev/v3"
)

type Client struct {
	client *resty.Client
	apiKey string
}

type Message struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

func NewClient(apiKey string) *Client {
	return &Client{
		client: resty.New().SetTimeout(10 * time.Second),
		apiKey: apiKey,
	}
}

func (c *Client) Send(ctx context.Context, message Message) error {
	response, err := c.client.R().
		SetContext(ctx).
		SetHeader("Authorization", "Bearer "+c.apiKey).
		SetBody(message).
		Post("https://api.resend.com/emails")
	if err != nil {
		return err
	}

	if response.StatusCode() >= 400 {
		return fmt.Errorf("resend returned status %d: %s", response.StatusCode(), response.String())
	}

	return nil
}
