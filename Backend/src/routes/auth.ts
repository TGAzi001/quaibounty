import express from 'express';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { firebaseService } from '../services/firebaseService.js';
import { fetchGitHubUser } from '../services/githubService.js';
import { qbuser } from '../models/userSchema.js';
const router = express.Router();

const oauthStates = new Map<string, { timestamp: number, address: string }>();

setInterval(() => {
    const now = Date.now();
    for (const [state, data] of oauthStates.entries()) {
        if (now - data.timestamp > 10 * 60 * 1000) {
            oauthStates.delete(state);
        }
    }
}, 5 * 60 * 1000);

router.post('/api/auth/signin', async (req, res) => {
    try {
        const { userId, avatarUrl, email, displayName } = req.body;
        const userDoc = await firebaseService.getDocument('users', userId);
        if (userDoc) {
            console.log(`user ${userId} sign in`);
            
            // await firebaseService.updateDocument('users', userId, {
            //     'connectedAccounts.github': {
            //         accessToken
            //     },
            //     updatedAt: new Date()
            // });
    
            // await firebaseService.updateDocument('users', userId, {
            //     'profile.x': {
            //         avatarUrl
            //     }
            // });   
        } else {
            const userData = {
                id: userId,
                profile: {
                    displayName: displayName,
                    avatarUrl: avatarUrl,
                    email: email
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
            await firebaseService.createDocument('users', userData, userId);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error initiating signin:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sign in',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

router.post('/api/auth/github', async (req, res) => {
    try {
        const { address } = req.body;
        console.log("user id", address);

        const state = randomUUID();
        oauthStates.set(state, {
            timestamp: Date.now(),
            address: address
        });

        const clientId = process.env.GITHUB_CLIENT_ID!;
        const redirectUri = process.env.GITHUB_REDIRECT_URI!;
        const scope = 'repo read:user user:email';
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

        // Return JSON response instead of redirecting
        res.json({
            success: true,
            redirectUrl: authUrl
        });

    } catch (error) {
        console.error('❌ Error initiating github OAuth:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate github OAuth flow',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

router.get('/api/auth/callback/github', async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).json({
                success: false,
                error: 'Missing authorization code or state'
            });
        }

        const address = oauthStates.get(state as string)?.address;

        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code as string
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                error: 'Failed to obtain access token'
            });
        }

        const githubUser = await fetchGitHubUser(accessToken);
        const githubUserId = githubUser.id;

        await firebaseService.createDocument<qbuser>('qbusers', {address: address!}, githubUserId.toString());

        oauthStates.delete(state as string);
        console.log(`Successfully authenticated user ${address} with GitHub`);

        res.redirect(`${process.env.FRONTEND_URL}/bounties`);

    } catch (error) {
        console.error('❌ Error in GitHub OAuth callback:', error);
        res.redirect(process.env.FRONTEND_URL!);
    }
});

export default router;