import { sendPowerUserEmails, getPowerUserStats } from '../services/powerUserEmailService.js';
import '../services/firebaseService.js'; // Initialize Firebase

async function main() {
    try {
        console.log('🎯 CommitLog Power User Email Script');
        console.log('====================================\n');
        
        // First, show power user statistics
        await getPowerUserStats();
        
        // Ask for confirmation (in a real scenario, you might want to add a prompt)
        console.log('\n⚠️  IMPORTANT: This will send $10 Claude credits emails to power users!');
        console.log('Target users: 105573358331878979300, 114043823273419902043');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
        
        // Wait 5 seconds for user to cancel if needed
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Send the power user emails
        await sendPowerUserEmails();
        
    } catch (error) {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }
}

// Run the script
main().then(() => {
    console.log('\n✅ Power user email script completed successfully!');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});