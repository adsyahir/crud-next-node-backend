import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { connectDB } from './config/database';
import { useCors } from './config/cors';
import setupRoutes from './routes/index';

export const app = express();

app.use(useCors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express.js with TypeScript!');
});

// Setup all routes
setupRoutes(app);

const port = process.env.APP_PORT;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();