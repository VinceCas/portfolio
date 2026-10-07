/** @typedef {{ contributionCount: number; date: string; color: string }} ContributionDay */
/** @typedef {{ contributionDays: ContributionDay[] }} ContributionWeek */
/** @typedef {{ totalContributions: number; weeks: ContributionWeek[] }} ContributionCalendar */


const query = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            color
          }
        }
      }
    }
  }
}
`;

/** @type {ContributionCalendar} */
const emptyCalendar = {
  totalContributions: 0,
  weeks: [],
};

/**
 * @param {string} username
 * @returns {Promise<ContributionCalendar>}
 */
export async function getGithubContributions(username) {
  const token = import.meta.env.GITHUB_TOKEN;

  if (!token) {
    console.warn("GitHub contributions are unavailable: GITHUB_TOKEN is not configured.");
    return emptyCalendar;
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { login: username },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status}.`);
    }

    const json = await response.json();
    const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;

    if (json?.errors?.length) {
      throw new Error(json.errors.map((error) => error.message).join("; "));
    }

    if (!calendar) {
      throw new Error("GitHub API returned no contribution calendar data.");
    }

    return calendar;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`GitHub contributions are unavailable: ${message}`);
    return emptyCalendar;
  }
}