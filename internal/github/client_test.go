package github

import (
	"strings"
	"testing"

	"golang.org/x/net/html"
)

func TestParseContributionCalendar(t *testing.T) {
	document, err := html.Parse(strings.NewReader(`
		<h2 id="js-contribution-activity-description">1,234 contributions in the last year</h2>
		<tool-tip for="day-1">5 contributions on Jan 1</tool-tip>
		<tool-tip for="day-2">No contributions on Jan 2</tool-tip>
		<table>
			<td class="ContributionCalendar-day" id="day-2" data-date="2026-01-02" data-level="0"></td>
			<td class="ContributionCalendar-day" id="day-1" data-date="2026-01-01" data-level="3"></td>
		</table>`))
	if err != nil {
		t.Fatal(err)
	}

	activity, err := parseContributionCalendar(document)
	if err != nil {
		t.Fatal(err)
	}
	if activity.Total != 1234 {
		t.Fatalf("total = %d, want 1234", activity.Total)
	}
	if len(activity.Days) != 2 || activity.Days[0].Date != "2026-01-01" || activity.Days[0].Count != 5 {
		t.Fatalf("unexpected days: %#v", activity.Days)
	}
}

func TestContributionCount(t *testing.T) {
	for label, want := range map[string]int{
		"No contributions on Jan 1": 0,
		"7 contributions on Jan 2":  7,
		"unknown":                   0,
	} {
		if got := contributionCount(label); got != want {
			t.Errorf("contributionCount(%q) = %d, want %d", label, got, want)
		}
	}
}

func TestPriorityIndexIsCaseInsensitiveAndSubstringBased(t *testing.T) {
	priorities := []string{"hyperion", "fafnir"}
	if got := priorityIndex("My-Hyperion-App", priorities); got != 0 {
		t.Fatalf("priorityIndex() = %d, want 0", got)
	}
	if got := priorityIndex("other", priorities); got != -1 {
		t.Fatalf("priorityIndex() = %d, want -1", got)
	}
}
