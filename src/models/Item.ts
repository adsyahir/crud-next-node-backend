import mongoose from "mongoose";
import { ItemTypes } from "../types/item";

const itemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
  },
  { timestamps: true }
);

export const Item = mongoose.model<ItemTypes>("Item", itemSchema);
