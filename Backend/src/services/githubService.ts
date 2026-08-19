import axios from "axios";

interface GitHubUserResponse {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
}

interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
}

/**
 * Fetches the authenticated GitHub user's profile using an OAuth access token.
 */
async function fetchGitHubUser(accessToken: string): Promise<GitHubUserResponse> {
  const response = await axios.get<GitHubUserResponse>("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return response.data;
}

/**
 * The /user endpoint's `email` field is often null if the user hasn't set
 * a public email. This fetches their verified emails separately — requires
 * the "user:email" OAuth scope to have been requested at authorize time.
 */
async function fetchPrimaryVerifiedEmail(accessToken: string): Promise<string | null> {
  const response = await axios.get<GitHubEmailResponse[]>(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  const primary = response.data.find((e) => e.primary && e.verified);
  return primary?.email ?? null;
}

// --- Usage, continuing directly from your token exchange ---
//
// const accessToken = tokenResponse.data.access_token;
//
// const githubUser = await fetchGitHubUser(accessToken);
// console.log(githubUser.id);    // numeric GitHub user ID — stable, never changes, use this as your key
// console.log(githubUser.login); // username — can change, don't use as a primary key
//
// const email = await fetchPrimaryVerifiedEmail(accessToken); // may be null if scope wasn't granted

export { fetchGitHubUser, fetchPrimaryVerifiedEmail };
export type { GitHubUserResponse, GitHubEmailResponse };