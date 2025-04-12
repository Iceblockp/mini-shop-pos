import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";

const ProductList = lazy(() => import("./components/ProductList"));
const SalesPage = lazy(() =>
  import("./components/SalesPage").then((module) => ({
    default: module.SalesPage,
  }))
);
const CategoryManager = lazy(() =>
  import("./components/CategoryManager").then((module) => ({
    default: module.CategoryManager,
  }))
);
const TransactionHistory = lazy(() =>
  import("./components/TransactionHistory").then((module) => ({
    default: module.TransactionHistory,
  }))
);
const Dashboard = lazy(() =>
  import("./components/Dashboard").then((module) => ({
    default: module.default,
  }))
);
const Reports = lazy(() =>
  import("./components/Reports").then((module) => ({
    default: module.default,
  }))
);

const SupplierManager = lazy(() =>
  import("./components/SupplierManager").then((module) => ({
    default: module.default,
  }))
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <ProductList />,
      },
      {
        path: "sales",
        element: <SalesPage />,
      },
      {
        path: "categories",
        element: <CategoryManager />,
      },
      {
        path: "transactions",
        element: <TransactionHistory />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "reports",
        element: <Reports />,
      },

      {
        path: "suppliers",
        element: <SupplierManager />,
      },
      {
        path: "*",
        element: (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
          </div>
        ),
      },
    ],
  },
];
