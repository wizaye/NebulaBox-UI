// api/cron.js
import { storeProblems } from '../storeProblems.js'; // Adjust the path as necessary
import { config } from 'dotenv';

config();

export default async function handler(req, res) {
  // Check the Authorization header for security
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    await storeProblems();
    res.status(200).end('Problems stored successfully!');
  } catch (error) {
    console.error('Error executing cron job:', error);
    res.status(500).end('Internal Server Error');
  }
}
