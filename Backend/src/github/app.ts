import { App } from "@octokit/app";
import { createNodeMiddleware } from "@octokit/webhooks";
import fs from "node:fs";
import { setupIssueHandlers } from "./issues.js";
import { setupPRHandlers } from "./prs.js";

const appId = process.env.APP_ID!;
const privateKeyPath = process.env.PRIVATE_KEY_PATH!;
const webhookSecret = process.env.WEBHOOK_SECRET!;

let privateKey: string;
try {
  privateKey = fs.readFileSync(privateKeyPath, "utf8");
} catch (error) {
  throw new Error(
    `Failed to read private key at "${privateKeyPath}": ${
      error instanceof Error ? error.message : String(error)
    }`
  );
}

export const githubApp = new App({
  appId,
  privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});

// Initialize webhook event listeners
setupIssueHandlers(githubApp);
setupPRHandlers(githubApp);

export const githubWebhookMiddleware = createNodeMiddleware(githubApp.webhooks, {
  path: "/api/github/webhooks",
});