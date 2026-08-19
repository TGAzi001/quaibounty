import express from 'express';
import { firebaseService } from '../services/firebaseService.js';
import { userData } from '../models/userSchema.js';
import { DateTime } from 'luxon';

const router = express.Router();

router.post('/api/createSchedule', async (req, res) => {
    const { userId, repo, type, time, timezone, day } = req.body;

    try {
        // Get user's display name from users collection
        const userDoc = await firebaseService.getDocument<userData>('users', userId);
        console.log('Creating schedule:', { userId, repo, type, time, day });
        
        if (!userDoc) {
            console.log("User not found");
            return res.status(404).json({ error: 'User not found' });
        }
        
        const _time = Number(time);
        const username = userDoc.profile.displayName;
        const postUTCHour = DateTime.fromObject({ hour: _time }, { zone: timezone }).toUTC().hour;
        const scheduleData = {
            userId,
            username,
            repo,
            type,
            time,
            postUTCHour,
            ...(day && { day }),
            createdAt: new Date().toISOString()
        };

        // Save to appropriate collections based on schedule type
        if (type === 'daily') {
            await firebaseService.createDocument('dailyposts', scheduleData);
        } else if (type === 'weekly') {
            await firebaseService.createDocument('weeklyposts', scheduleData);
        }

        // Add to user's schedules subcollection
        await firebaseService.addToSubcollection('users', userId, 'schedules', {
            repo,
            type,
            time,
            ...(day && { day }),
            createdAt: new Date().toISOString()
        });

        console.log("Schedule created successfully");
        
        res.status(200).json({ message: 'Schedule created successfully' });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
})

export default router;