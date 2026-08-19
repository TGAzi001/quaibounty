import { sendBulkEmails } from '../services/bulkEmailService.js';
import '../services/firebaseService.js'; // Initialize Firebase

async function main() {
    try {
        console.log('🚀 CommitLog Bulk Email Script');
        console.log('================================\n');
        
        // Ask for confirmation (in a real scenario, you might want to add a prompt)
        console.log('\n⚠️  IMPORTANT: This will send emails to all eligible users!');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
        
        // Send the bulk emails
        await sendBulkEmails();
        
    } catch (error) {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }
}

// Run the script
main().then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});