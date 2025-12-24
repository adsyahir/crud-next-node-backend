import express, { Express, Request, Response } from 'express';
// import userRoutes from './routes/userRoutes.js';
// import { errorHandler } from './middleware/errorHandler.js';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'API is running',
    version: '1.0.0' 
  });
});

// app.use('/api/users', userRoutes);

// Error handling
// app.use(errorHandler);

export default app;