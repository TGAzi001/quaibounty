import express from 'express';
import { firebaseService } from '../services/firebaseService.js';
import { userData, userSchedule } from '../models/userSchema.js';
import { githubService } from '../services/githubService.js';
import historySchema from '../models/historySchema.js';
import { Timestamp } from 'firebase-admin/firestore';

const router = express.Router();

router.get('/api/user', async (req, res) => {
    const { userId } = req.query;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Valid userId is required' });
    }

    try {
        const userDoc = await firebaseService.getDocument<userData>('users', userId);

        if (!userDoc) {
            console.log("error");
            return res.status(404).json({ error: 'User not found' });
        }

        const username = userDoc.profile.displayName;
        const avatarUrl = userDoc.profile.avatarUrl;

        const hasGithub = !!userDoc.connectedAccounts?.github;
        const hasX = !!userDoc.connectedAccounts?.x;

        let userRepos;
        let userSchedules;
        let userHistory;

        if (hasGithub) {
            userRepos = await githubService.getUserRepositories(userDoc.connectedAccounts?.github?.accessToken!, username);
            userSchedules = await firebaseService.getSubcollectionDocuments<userSchedule>('users', userId, 'schedules');
            const rawHistory = await firebaseService.getSubcollectionDocuments<historySchema>('users', userId, 'history');

            // Convert Firestore timestamps to ISO strings for frontend compatibility
            userHistory = rawHistory.map(item => {
                let timestamp;

                if (item.timestamp && typeof item.timestamp === 'object' && 'toDate' in item.timestamp) {
                    // Firestore Timestamp object - cast to proper type
                    try {
                        timestamp = (item.timestamp as Timestamp).toDate().toISOString();
                    } catch (error) {
                        console.warn('Failed to convert Firestore timestamp:', error);
                        timestamp = new Date().toISOString();
                    }
                } else if (item.timestamp) {
                    // Already a string or Date, validate it
                    const testDate = new Date(item.timestamp as string | Date);
                    if (isNaN(testDate.getTime())) {
                        console.warn('Invalid timestamp found:', item.timestamp);
                        timestamp = new Date().toISOString();
                    } else {
                        timestamp = testDate.toISOString();
                    }
                } else {
                    // No timestamp provided, use current time
                    timestamp = new Date().toISOString();
                }

                return {
                    ...item,
                    timestamp
                };
            }).sort((a, b) => {
                // Sort by timestamp, latest first
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB.getTime() - dateA.getTime();
            });
        }


        const userData = {
            userId,
            username,
            avatarUrl,
            hasGithub,
            hasX,
            repos: userRepos,
            schedules: userSchedules,
            history: userHistory
        };

        console.log("user data fetched successfully");

        res.status(200).json({ userData: userData });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

export default router;