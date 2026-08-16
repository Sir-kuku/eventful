import cron from 'node-cron';
import { processReminders } from './services/reminder.service';

// Only run the cron job if we are NOT in a test environment
if (process.env.NODE_ENV !== 'test') {
  // Schedule the job to run every hour (at the 0th minute of every hour)
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron Job] Running hourly reminder check...');
    await processReminders();
  });
  
  console.log('? Cron job scheduler initialized for reminders.');
}
