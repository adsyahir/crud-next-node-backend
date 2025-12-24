import cors from 'cors';
import express from 'express';

const corsOptions = {
    // Allow only requests from this domain
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
};

export const useCors = () => {
   return cors(corsOptions);
};


