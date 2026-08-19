import { Timestamp } from 'firebase-admin/firestore';

interface historySchema { 
  id?: string;
  content: string; 
  link: string; 
  timestamp: Date | Timestamp | string; // Allow Firestore Timestamp, Date, or ISO string
}
export default historySchema;