import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { dbOperations } from "../utils/database";

interface DashboardMetrics {
  dailySales: number;
  todayTransactions: number;
  averageOrderValue: number;
  popularProducts: Array<{
    name: string;
    soldCount: number;
  }>;
  lowStockAlerts: Array<{
    name: string;
    stock: number;
  }>;
  salesTarget: {
    current: number;
    target: number;
  };
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    dailySales: 0,
    todayTransactions: 0,
    averageOrderValue: 0,
    popularProducts: [],
    lowStockAlerts: [],
    salesTarget: {
      current: 0,
      target: 1000, // Example target
    },
  });

  useEffect(() => {
    loadDashboardData();
    // Refresh dashboard data every 5 minutes
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const transactions = await dbOperations.getAllTransactions();
      const products = await dbOperations.getAllProducts();

      // Calculate today's transactions
      const todayTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= today;
      });

      // Calculate daily sales
      const dailySales = todayTransactions.reduce(
        (sum, t) => sum + t.totalAmount,
        0
      );

      // Calculate average order value
      const averageOrderValue =
        todayTransactions.length > 0
          ? dailySales / todayTransactions.length
          : 0;

      // Get popular products
      const productSales: Record<string, number> = {};
      todayTransactions.forEach((transaction) => {
        transaction.items.forEach((item) => {
          productSales[item.name] =
            (productSales[item.name] || 0) + item.quantity;
        });
      });

      const popularProducts = Object.entries(productSales)
        .map(([name, soldCount]) => ({ name, soldCount }))
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 5);

      // Get low stock alerts
      const lowStockAlerts = products
        .filter((p) => p.stockQuantity < 10)
        .map((p) => ({
          name: p.name,
          stock: p.stockQuantity,
        }));

      setMetrics({
        dailySales,
        todayTransactions: todayTransactions.length,
        averageOrderValue,
        popularProducts,
        lowStockAlerts,
        salesTarget: {
          current: dailySales,
          target: 1000, // Example target
        },
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const progressPercentage =
    (metrics.salesTarget.current / metrics.salesTarget.target) * 100;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Sales
              </Typography>
              <Typography variant="h4">
                ${metrics.dailySales.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Transactions
              </Typography>
              <Typography variant="h4">{metrics.todayTransactions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4">
                ${metrics.averageOrderValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Target Progress */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Sales Target Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(progressPercentage, 100)}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box
                sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2" color="textSecondary">
                  ${metrics.salesTarget.current.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Target: ${metrics.salesTarget.target.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Products */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Popular Products
              </Typography>
              <List>
                {metrics.popularProducts.map((product, index) => (
                  <React.Fragment key={product.name}>
                    <ListItem>
                      <ListItemText
                        primary={product.name}
                        secondary={`${product.soldCount} units sold`}
                      />
                    </ListItem>
                    {index < metrics.popularProducts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Alerts
              </Typography>
              <List>
                {metrics.lowStockAlerts.map((product, index) => (
                  <React.Fragment key={product.name}>
                    <ListItem>
                      <ListItemText
                        primary={product.name}
                        secondary={`Current stock: ${product.stock} units`}
                      />
                    </ListItem>
                    {index < metrics.lowStockAlerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
