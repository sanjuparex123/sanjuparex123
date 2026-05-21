import { Router } from "express";
export const dashboardRouter = Router();
dashboardRouter.get("/summary", (_req,res)=>res.json({kpis:{revenue:120000,purchaseOrders:47,inventoryValue:380000,suppliers:12,vendors:18,lowStock:26,incomingStock:4200,pendingPOs:9},widgets:{stockHealthScore:82}}));
