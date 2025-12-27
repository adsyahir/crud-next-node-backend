import {Item} from "../models/Item";
import type { Request, Response } from 'express';


export async function add (req : Request, res: Response) : Promise<Response> {
    try{
        console.log(req.body);
        const item = new Item({
            name: req.body.name,
            description: req.body.name,
        });
        await item.save();
 
        return res.status(200).json(item);  
    }catch(e : unknown){
        const message = e instanceof Error ? e.message : 'An error occurred';
        return res.status(500).json({message});
    }
}

export async function update(req : Request, res: Response) : Promise<Response> {
    try{
        const { id } = req.params;
        const item = await Item.findByIdAndUpdate(id, req.body, { new: true });

        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            });
        }

        return res.status(200).json(item);
    }catch(e : unknown){
        const message = e instanceof Error ? e.message : 'An error occurred';
        return res.status(500).json({message});
    }
}

export async function remove(req: Request, res: Response) : Promise<Response> {
    try {
        const { id } = req.params;

        const item = await Item.findByIdAndDelete(id);

        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            });
        }

        return res.status(200).json({
            message: 'Item deleted successfully'
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'An error occurred';
        return res.status(500).json({ message });
    }
}

export async function getItem(req: Request, res: Response) : Promise<Response> {
    try {
        const { id } = req.params;

        const items =  await Item.findById(id);

        if(!items){
            return res.status(404).json({
                message: 'Item not found'
            });
        }

        return res.status(200).json(items);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'An error occurred';
        return res.status(500).json({ message });
    }
}

export async function getAllItem(req: Request, res: Response) : Promise<Response> {
    try {
        const items =  await Item.find();  
 
        if(!items){
            return res.status(404).json({
                message: 'No items found'
            });
        }
        return res.status(200).json(items);
    }catch(e: unknown){
        const message = e instanceof Error ? e.message : 'An error occurred';
        return res.status(500).json({ message });
    }
}

