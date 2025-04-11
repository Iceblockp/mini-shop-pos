import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { InventoryMovement } from "../utils/inventoryTypes";

interface InventoryHistoryProps {
  movements: InventoryMovement[];
}

const InventoryHistory: React.FC<InventoryHistoryProps> = ({ movements }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Inventory Movement History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Previous Stock</TableCell>
              <TableCell align="right">New Stock</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {new Date(movement.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  {movement.adjustmentType === "add"
                    ? "Stock Added"
                    : "Stock Removed"}
                </TableCell>
                <TableCell align="right">{movement.quantity}</TableCell>
                <TableCell align="right">{movement.previousStock}</TableCell>
                <TableCell align="right">{movement.newStock}</TableCell>
                <TableCell>{movement.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryHistory;
