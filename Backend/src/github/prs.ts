import { App } from "@octokit/app";
import { firebaseService } from '../services/firebaseService.js';
import bountySchema from "../models/bountySchema.js";
import { quais } from "quais";
import { qbuser } from "../models/userSchema.js";

const BOUNTY_ID_PATTERN = /bounty\s*id\s*-\s*([A-Za-z0-9_-]+)/i;

interface BountyIdExtractionResult {
  bountyId: string | null;
  source: "title" | "body" | null;
  conflict: boolean; // true if title and body both had a bountyId AND they differ
}

/**
 * Extracts a bountyId from a single string, or null if not found.
 */
function extractBountyId(text: string): string | null {
  const match = text.match(BOUNTY_ID_PATTERN);
  return match ? match[1] : null;
}

function resolveBountyId(title: string, body: string): BountyIdExtractionResult {
  const fromTitle = extractBountyId(title);
  const fromBody = extractBountyId(body);

  if (fromTitle && fromBody && fromTitle !== fromBody) {
    return { bountyId: null, source: null, conflict: true };
  }

  if (fromTitle) return { bountyId: fromTitle, source: "title", conflict: false };
  if (fromBody) return { bountyId: fromBody, source: "body", conflict: false };

  return { bountyId: null, source: null, conflict: false };
}

export function setupPRHandlers(app: App): void {
  app.webhooks.on("pull_request.closed", async ({ octokit, payload }) => {
    const pr = payload.pull_request;
    const repository = payload.repository;
    const userId = pr.user.id.toString();

    // Only proceed if the PR was merged, not just closed without merging
    if (!pr.merged) return;

    const { bountyId, source, conflict } = resolveBountyId(
      pr.title ?? "",
      pr.body ?? ""
    );

    const owner = repository.owner.login;
    const repo = repository.name;

    const userDoc = await firebaseService.getDocument<qbuser>('qbusers', userId);
    const userAddress = userDoc?.address;

        const EscrowAbi = [
      {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "repoIdHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint64",
          "name": "issueNumber",
          "type": "uint64"
        }
      ],
      "name": "createBounty",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "bountyId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "bountyId",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          }
        ],
        "name": "resolve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]

    if (conflict) {
      console.warn(
        `[PR #${pr.number} Merged] Conflicting bountyId values in title vs body — skipping.`
      );
      try {
        await octokit.request(
          "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
          {
            owner,
            repo,
            issue_number: pr.number,
            body:
              `⚠️ **Bounty ID Conflict**: This PR's title and description reference ` +
              `different bounty IDs. Please make sure only one \`bountyId - <id>\` ` +
              `reference is present, then contact a maintainer to process this payout manually.`,
          }
        );
      } catch (error) {
        console.error(`[PR #${pr.number} Merged] Failed to post conflict comment:`, error);
      }
      return;
    }

    if (!bountyId) {
      // No bountyId referenced at all — this PR isn't claiming a bounty, nothing to do.
      return;
    }

    console.log(
      `[PR #${pr.number} Merged] Found bountyId "${bountyId}" in PR ${source}.`
    );

    const bounty = await firebaseService.getDocument<bountySchema>('bounties', bountyId);
    if (bounty?.repo == repo || bounty?.org == owner) {
      const bountyId = bounty?.id;
      const RPC_URL = process.env.RPC_URL!;
      const signer = process.env.SIGNER!;
      const provider = new quais.JsonRpcProvider(RPC_URL, undefined, { usePathing: true })
      const wallet = new quais.Wallet(signer, provider);
      const Escrow = new quais.Contract("0x0041Dfeb51aFB837505568DEbf45114efD127009", EscrowAbi, wallet);

      const tx = await Escrow.resolve(bountyId, userAddress);
      await tx.wait();
    }
  });
}