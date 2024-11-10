// index.js
import express from 'express';
import { config } from 'dotenv';
import cors from 'cors'; // Correctly import cors
import problemsRouter from './routes/problems.js';
import handler from './api/cron.js'; // Import the cron handler for local testing

const app = express();
const PORT = process.env.PORT || 3000;

config();

// Middleware
app.use(cors()); // Call cors() to use it as middleware
app.use(express.json());

// Routes
app.use('/problems', problemsRouter);

// Local testing route for `/api/cron`
app.use('/api/cron', handler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
