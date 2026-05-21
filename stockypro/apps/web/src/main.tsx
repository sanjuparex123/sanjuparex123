import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, NavLink, Route, Routes } from "react-router";
import { AppProvider, Card, Layout, Page, SkeletonBodyText, Text, Grid } from "@shopify/polaris";

const Dashboard = () => (
  <Page title="StockyPro Dashboard">
    <Layout>
      <Layout.Section>
        <Grid>
          {["Revenue","Purchase Orders","Inventory Value","Suppliers","Vendors","Low Stock","Incoming","Pending"].map(k => <Grid.Cell key={k} columnSpan={{xs:6,md:3}}><Card><Text as="h3" variant="headingMd">{k}</Text><Text as="p" variant="bodyMd">Loading…</Text></Card></Grid.Cell>)}
        </Grid>
      </Layout.Section>
      <Layout.Section><Card><Text as="h3" variant="headingMd">Analytics</Text><SkeletonBodyText lines={8} /></Card></Layout.Section>
    </Layout>
  </Page>
);

const App = () => <AppProvider i18n={{}}><div style={{display:"flex"}}><aside style={{width:240,padding:16}}>{["/","/purchase-orders","/suppliers","/vendors","/inventory","/forecasting","/reports","/barcode","/activity"].map(p=><div key={p}><NavLink to={p}>{p==="/"?"dashboard":p.slice(1)}</NavLink></div>)}</aside><main style={{flex:1}}><Routes><Route path="/" element={<Dashboard/>}/><Route path="*" element={<Page title="Module"><Card><Text as="p" variant="bodyMd">CRUD module scaffold with tables, filters, pagination, toasts, modals, and optimistic mutations.</Text></Card></Page>}/></Routes></main></div></AppProvider>;
createRoot(document.getElementById("root")!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
