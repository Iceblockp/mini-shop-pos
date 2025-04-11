import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import { useProducts } from "../contexts/ProductContext";
import { Product } from "../utils/database";
import { InventoryMovement } from "../utils/inventoryTypes";
import InventoryHistory from "./InventoryHistory";

interface InventoryAdjustmentProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

type AdjustmentType = "add" | "remove";

const InventoryAdjustment: React.FC<InventoryAdjustmentProps> = ({
  open,
  product,
  onClose,
}) => {
  const { updateStockQuantity, getInventoryMovements } = useProducts();
  const [quantity, setQuantity] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("add");
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  useEffect(() => {
    if (product?.id) {
      loadMovementHistory();
    }
  }, [product]);

  const loadMovementHistory = async () => {
    if (product?.id) {
      try {
        const history = await getInventoryMovements(product.id);
        setMovements(history);
      } catch (err) {
        console.error("Failed to load inventory history:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;

    const adjustmentQuantity = parseInt(quantity);
    if (isNaN(adjustmentQuantity) || adjustmentQuantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!reason.trim()) {
      setError("Please enter a reason for the adjustment");
      return;
    }

    try {
      const finalQuantity = adjustmentQuantity;
      await updateStockQuantity(
        product.id,
        finalQuantity,
        reason,
        adjustmentType
      );
      await loadMovementHistory();
      setQuantity("");
      setReason("");
      setError("");
    } catch (err) {
      setError("Failed to update inventory");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust Inventory for {product.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Stock: {product.stockQuantity}
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Adjustment Type</InputLabel>
            <Select
              value={adjustmentType}
              label="Adjustment Type"
              onChange={(e) =>
                setAdjustmentType(e.target.value as AdjustmentType)
              }
            >
              <MenuItem value="add">Add Stock</MenuItem>
              <MenuItem value="remove">Remove Stock</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            label="Reason"
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Divider sx={{ my: 2 }} />
          <InventoryHistory movements={movements} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update Stock
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryAdjustment;
