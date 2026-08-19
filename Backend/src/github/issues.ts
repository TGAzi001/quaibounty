import { App } from "@octokit/app";
import { firebaseService } from '../services/firebaseService.js';
import { quais, solidityPackedKeccak256 } from "quais";
import bountySchema from "../models/bountySchema.js";
import EscrowJson from "../artifacts/contractAbi.json";
import { generateRandomId } from "../services/idService.js";

const DEFAULT_KEYWORDS = ["quaiBounty"] as const;

interface ExtractedIssue {
  issueNumber: number;
  repoIdHash: string;
  owner: string; // User or Organization name
  issueTitle: string;
  issueDescription: string;
}

/**
 * Matches keywords as whole words to avoid false positives,
 * e.g. "bug" should not match inside "debugging".
 */
function findMatchedKeywords(text: string, keywords: readonly string[]): string[] {
  const lowerText = text.toLowerCase();
  return keywords.filter((kw) => {
    const pattern = new RegExp(`\\b${kw}\\b`, "i");
    return pattern.test(lowerText);
  });
}

export function setupIssueHandlers(app: App) {
  app.webhooks.on("issues.opened", async ({ octokit, payload }) => {
    const { title, body, number } = payload.issue;
    const text = `${title} ${body ?? ""}`;

    // console.log(`[Issue #${number}] Received new issue: "${title}"`);
    console.log(`[Issue #] Received new issue`);

    const matchedKeywords = findMatchedKeywords(text, DEFAULT_KEYWORDS);

    if (matchedKeywords.length === 0) {
      return;
    }

    // Extract requested issue fields
    const issueData: ExtractedIssue = {
      issueNumber: number,
      repoIdHash: quais.id(String(payload.repository.id)),
      owner: payload.repository.owner.login,
      issueTitle: title,
      issueDescription: body ?? "",
    };

    console.log(`[Issue #${issueData.issueNumber}] Extracted Data:`, issueData);

    try {
      // call createBounty function
      const RPC_URL = process.env.RPC_URL!;
      const signer = process.env.SIGNER!;
      const provider = new quais.JsonRpcProvider(RPC_URL, undefined, { usePathing: true })
      const wallet = new quais.Wallet(signer, provider);
      const Escrow = new quais.Contract("0x0041Dfeb51aFB837505568DEbf45114efD127009", EscrowJson.abi, wallet);

      const tx = await Escrow.createBounty(issueData.repoIdHash, issueData.issueNumber);
      await tx.wait();

      const docId = generateRandomId();
      const bountyId = solidityPackedKeccak256(["bytes32", "uint64"], [issueData.repoIdHash, issueData.issueNumber]);
      await firebaseService.createDocument<bountySchema>('bounties', {
        id: bountyId,
        org: issueData.owner,
        repo: payload.repository.name,
        issueNumber: issueData.issueNumber.toString(),
        title: issueData.issueTitle,
        description: issueData.issueDescription,
        link: `https://github.com/${payload.repository.owner.login}/${payload.repository.name}/issues/${issueData.issueNumber}`,
        prize: 0
      }, docId);

      await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: number,
          body: `🤖 **Tracked Issue**: ${number}. Please fund the corresponding bounty on QuaiBounty`,
        }
      );
    } catch (error) {
      console.error(`[Issue #${number}] Failed to post comment:`, error);
    }
  });
}