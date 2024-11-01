// index.js
import express from 'express';
import { config } from 'dotenv';
import problemsRouter from './routes/problems.js';
import cors from 'cors'; // Correctly import cors

const app = express();
const PORT = process.env.PORT || 3000;

config();

// Middleware
app.use(cors()); // Call cors() to use it as middleware
app.use(express.json());

// Routes
app.use('/problems', problemsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
