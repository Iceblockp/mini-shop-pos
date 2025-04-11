import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Box,
  Tooltip,
  Dialog,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  QrCodeScanner as QrCodeScannerIcon,
} from "@mui/icons-material";
import { BarcodeScanner } from "./BarcodeScanner";
import InventoryAdjustment from "./InventoryAdjustment";
import ProductForm from "./ProductForm";
import { useProducts } from "../contexts/ProductContext";
import { Product } from "../utils/database";

const ProductList: React.FC = () => {
  const { products, loading, error, searchProducts, deleteProduct } =
    useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInventoryAdjustmentOpen, setIsInventoryAdjustmentOpen] =
    useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    // searchProducts(query);
  };

  if (loading) {
    return <Typography>Loading products...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          Product List
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={(event) => {
              event.key === "Enter" && searchProducts(searchQuery);
            }}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Scan Barcode">
            <IconButton
              color="primary"
              onClick={() => setIsScannerOpen(true)}
              size="small"
            >
              <QrCodeScannerIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                <TableCell align="right">{product.stockQuantity}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Product">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsProductFormOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Adjust Inventory">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsInventoryAdjustmentOpen(true);
                      }}
                    >
                      <InventoryIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Product">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => product.id && deleteProduct(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <InventoryAdjustment
        open={isInventoryAdjustmentOpen}
        product={selectedProduct}
        onClose={() => {
          setIsInventoryAdjustmentOpen(false);
          setSelectedProduct(null);
        }}
      />
      <ProductForm
        open={isProductFormOpen}
        product={selectedProduct || undefined}
        onClose={() => {
          setIsProductFormOpen(false);
          setSelectedProduct(null);
        }}
      />
      <Dialog
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Scan Product Barcode
          </Typography>
          <BarcodeScanner
            onScan={(barcode) => {
              setSearchQuery(barcode);
              searchProducts(barcode);
              setIsScannerOpen(false);
            }}
            onError={(error) => {
              console.error("Scanner error:", error);
              setIsScannerOpen(false);
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProductList;
