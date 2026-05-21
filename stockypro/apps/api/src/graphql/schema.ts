import { buildSchema } from "graphql";
export const schema = buildSchema(`
  type KPI { revenue: Float!, purchaseOrders: Int!, inventoryValue: Float!, suppliers: Int!, vendors: Int!, lowStock: Int!, incomingStock: Int!, pendingPOs: Int! }
  type DashboardSummary { kpis: KPI! }
  type Query { dashboardSummary: DashboardSummary! }
`);
