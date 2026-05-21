import { Router } from "express";
import { z } from "zod";
const schema = z.object({ supplierId: z.string(), poNumber: z.string(), items: z.array(z.object({ sku: z.string(), quantityOrdered: z.number().int().positive(), costPrice: z.number().nonnegative() })) });
export const purchaseOrderRouter = Router();
purchaseOrderRouter.get("/", (_req,res)=>res.json({data:[],meta:{page:1,total:0}}));
purchaseOrderRouter.post("/", (req,res)=>{ const parsed=schema.safeParse(req.body); if(!parsed.success) return res.status(400).json(parsed.error.flatten()); return res.status(201).json({message:"PO created", data:parsed.data});});
