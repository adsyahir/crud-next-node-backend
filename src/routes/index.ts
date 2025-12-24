import type { Express } from 'express';
import itemRoute from "./ItemRoute";

export default function setupRoutes(app: Express) {
    app.use('/api/items', itemRoute);
    // Add more routes here in the future
}