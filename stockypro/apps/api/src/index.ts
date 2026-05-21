import express from "express";
import cors from "cors";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./graphql/schema";
import { purchaseOrderRouter } from "./modules/purchase-orders/controllers/rest";
import { dashboardRouter } from "./modules/dashboard/controllers/rest";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/purchase-orders", purchaseOrderRouter);
app.use("/api/dashboard", dashboardRouter);
app.all("/graphql", createHandler({ schema }));

app.listen(process.env.PORT || 4000, () => console.log("API running"));
