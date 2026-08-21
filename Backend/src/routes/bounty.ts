// return bounties
// fund bounty

import express from 'express';
import { firebaseService } from '../services/firebaseService.js';
import bountySchema  from '../models/bountySchema.js';
import bountyDocSchema  from '../models/bountyDocSchema.js';

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

router.post('/api/fund', async (req, res) => {

    const { amount, bountyId } = req.body;
    const bountyDoc = await firebaseService.getDocumentByField<bountyDocSchema>('bounties', 'id', bountyId);
    if (!bountyDoc) {
        return res.status(404).json({ error: 'Bounty not found' });
    }

    try {
        const docId = bountyDoc.bid;

        await firebaseService.updateDocument('bounties', docId, {
            'prize': bountyDoc.prize + amount,
        });

        res.status(200).json({ message: 'Bounty funded successfully' });
    } catch (error) {
        console.error('Error funding bounty:', error);
        res.status(500).json({ error: 'Failed to fund bounty' });        
    }

});

export default router;