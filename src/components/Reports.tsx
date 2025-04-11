import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import { dbOperations } from "../utils/database";
import { Transaction } from "../utils/transactionTypes";

interface SalesMetrics {
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  topSellingProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  lowStockProducts: Array<{
    name: string;
    currentStock: number;
  }>;
}

const Reports: React.FC = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    topSellingProducts: [],
    lowStockProducts: [],
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // Load transactions
      const transactions = await dbOperations.getAllTransactions();
      const products = await dbOperations.getAllProducts();

      // Calculate total sales and transactions
      const totalSales = transactions.reduce(
        (sum, t) => sum + t.totalAmount,
        0
      );
      const totalTransactions = transactions.length;
      const averageTransactionValue =
        totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Calculate top selling products
      const productSales: Record<
        string,
        { quantity: number; revenue: number }
      > = {};
      transactions.forEach((transaction) => {
        transaction.items.forEach((item) => {
          if (!productSales[item.name]) {
            productSales[item.name] = { quantity: 0, revenue: 0 };
          }
          productSales[item.name].quantity += item.quantity;
          productSales[item.name].revenue += item.unitPrice * item.quantity;
        });
      });

      const topSellingProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get low stock products (less than 10 items)
      const lowStockProducts = products
        .filter((p) => p.stockQuantity < 10)
        .map((p) => ({
          name: p.name,
          currentStock: p.stockQuantity,
        }));

      setMetrics({
        totalSales,
        totalTransactions,
        averageTransactionValue,
        topSellingProducts,
        lowStockProducts,
      });
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sales Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h5">
                ${metrics.totalSales.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h5">{metrics.totalTransactions}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Transaction Value
              </Typography>
              <Typography variant="h5">
                ${metrics.averageTransactionValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Products */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.topSellingProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">
                        ${product.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Low Stock Alert */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alert
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.lowStockProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">
                        {product.currentStock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
