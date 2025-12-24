import { Document } from "mongoose";

export interface ItemTypes extends Document {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}