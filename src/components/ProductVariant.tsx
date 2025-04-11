import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export interface ProductVariant {
  id?: number;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  attributes: {
    [key: string]: string;
  };
}

interface ProductVariantManagerProps {
  open: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  attributeTypes: string[];
}

const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  open,
  onClose,
  variants,
  onVariantsChange,
  attributeTypes,
}) => {
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    sku: "",
    name: "",
    price: 0,
    stockQuantity: 0,
    attributes: {},
  });

  const handleAddVariant = () => {
    const updatedVariants = [...variants, { ...newVariant, id: Date.now() }];
    onVariantsChange(updatedVariants);
    setNewVariant({
      sku: "",
      name: "",
      price: 0,
      stockQuantity: 0,
      attributes: {},
    });
  };

  const handleDeleteVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setNewVariant((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeName]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Product Variants</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Variant
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="SKU"
              value={newVariant.sku}
              onChange={(e) =>
                setNewVariant({ ...newVariant, sku: e.target.value })
              }
              size="small"
            />
            <TextField
              label="Name"
              value={newVariant.name}
              onChange={(e) =>
                setNewVariant({ ...newVariant, name: e.target.value })
              }
              size="small"
            />
            <TextField
              label="Price"
              type="number"
              value={newVariant.price}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              size="small"
            />
            <TextField
              label="Stock Quantity"
              type="number"
              value={newVariant.stockQuantity}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  stockQuantity: parseInt(e.target.value) || 0,
                })
              }
              size="small"
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            {attributeTypes.map((attr) => (
              <TextField
                key={attr}
                label={attr}
                value={newVariant.attributes[attr] || ""}
                onChange={(e) => handleAttributeChange(attr, e.target.value)}
                size="small"
              />
            ))}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVariant}
            disabled={!newVariant.sku || !newVariant.name}
          >
            Add Variant
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                {attributeTypes.map((attr) => (
                  <TableCell key={attr}>{attr}</TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={variant.id || index}>
                  <TableCell>{variant.sku}</TableCell>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell>${variant.price.toFixed(2)}</TableCell>
                  <TableCell>{variant.stockQuantity}</TableCell>
                  {attributeTypes.map((attr) => (
                    <TableCell key={attr}>
                      {variant.attributes[attr] || "-"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteVariant(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductVariantManager;
