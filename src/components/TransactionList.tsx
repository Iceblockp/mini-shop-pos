import React, { useState, useEffect } from "react";
import { Transaction } from "../utils/transactionTypes";
import { dbOperations } from "../utils/database";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

interface TransactionListProps {
  onTransactionSelect?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onTransactionSelect,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterAmount, setFilterAmount] = useState<string>("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await dbOperations.getAllTransactions();
      setTransactions(data);
      setError("");
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const getSortedAndFilteredTransactions = () => {
    return transactions
      .filter((transaction) => {
        const dateMatches = filterDate
          ? new Date(transaction.timestamp).toLocaleDateString() ===
            new Date(filterDate).toLocaleDateString()
          : true;
        const amountMatches = filterAmount
          ? transaction.totalAmount === parseFloat(filterAmount)
          : true;
        const methodMatches =
          filterPaymentMethod === "all" ||
          transaction.payment.method === filterPaymentMethod;
        return dateMatches && amountMatches && methodMatches;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return sortOrder === "asc"
            ? a.timestamp.getTime() - b.timestamp.getTime()
            : b.timestamp.getTime() - a.timestamp.getTime();
        } else {
          return sortOrder === "asc"
            ? a.totalAmount - b.totalAmount
            : b.totalAmount - a.totalAmount;
        }
      });
  };

  const handleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          label="Date"
        />
        <TextField
          type="number"
          value={filterAmount}
          onChange={(e) => setFilterAmount(e.target.value)}
          placeholder="Filter by amount"
          size="small"
          label="Amount"
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            label="Payment Method"
          >
            <MenuItem value="all">All Payment Methods</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="mobile">Mobile Payment</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort("date")}
                sx={{ cursor: "pointer" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Date
                  {sortBy === "date" && (
                    <IconButton size="small">
                      {sortOrder === "asc" ? (
                        <ArrowUpward fontSize="small" />
                      ) : (
                        <ArrowDownward fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </Box>
              </TableCell>
              <TableCell>Items</TableCell>
              <TableCell
                onClick={() => handleSort("amount")}
                sx={{ cursor: "pointer" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Amount
                  {sortBy === "amount" && (
                    <IconButton size="small">
                      {sortOrder === "asc" ? (
                        <ArrowUpward fontSize="small" />
                      ) : (
                        <ArrowDownward fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </Box>
              </TableCell>
              <TableCell>Payment Method</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedAndFilteredTransactions().map((transaction) => (
              <TableRow
                key={transaction.timestamp.getTime()}
                hover
                onClick={() => onTransactionSelect?.(transaction)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Typography variant="body2">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {transaction.items.length} items
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transaction.items
                      .slice(0, 2)
                      .map((item) => item.name)
                      .join(", ")}
                    {transaction.items.length > 2 && "..."}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="primary">
                    ${transaction.totalAmount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.payment.method}
                    size="small"
                    color={
                      transaction.payment.method === "cash"
                        ? "success"
                        : transaction.payment.method === "card"
                        ? "primary"
                        : "secondary"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
