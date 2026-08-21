// return bounties
// fund bounty

import express from 'express';
import { firebaseService } from '../services/firebaseService.js';
import bountySchema  from '../models/bountySchema.js';

const router = express.Router();

router.get('/api/bounties', async (req, res) => {

    try {
        const bounties = await firebaseService.getAllDocuments<bountySchema>('bounties');

        console.log("bounties fetched successfully");

        res.status(200).json({ bounties: bounties });
    } catch (error) {
        console.error('Error fetching bounties:', error);
        res.status(500).json({ error: 'Failed to fetch bounties' });
    }
});

// router.post('/api/bounties', async (req, res) => {

//     const { amount } = req.body;
//     const bountyDoc = await firebaseService.getDocument('bounties', userId);
//     if (userDoc) {
//         console.log(`user ${userId} sign in`);
        
//     await firebaseService.updateDocument('users', userId, {
//         'connectedAccounts.github': {
//             accessToken
//         },
//         updatedAt: new Date()
//     });

//     await firebaseService.updateDocument('users', userId, {
//         'profile.x': {
//             avatarUrl
//         }
//     });  

//     try {
//         const bounties = await firebaseService.getAllDocuments<bountySchema>('bounties');

//         console.log("bounties fetched successfully");

//         res.status(200).json({ bounties: bounties });
//     } catch (error) {
//         console.error('Error fetching bounties:', error);
//         res.status(500).json({ error: 'Failed to fetch bounties' });
//     }
// });

export default router;