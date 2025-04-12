import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Product, BulkPrice, Promotion, dbOperations } from "../utils/database";
import { CategorySelector } from "./CategorySelector";
import { Category } from "../utils/categoryTypes";
import { BarcodeGenerator } from "./BarcodeGenerator";
import PricingManager from "./PricingManager";
import { useProducts } from "../contexts/ProductContext";
import { BarcodeScanner } from "./BarcodeScanner";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
}

const initialProduct: Product = {
  name: "",
  description: "",
  sku: "",
  price: 0,
  category: "",
  stockQuantity: 0,
  imageUrl: "",
  costPrice: 0,
  supplier: "",
  bulkPrices: [],
};

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  product,
}) => {
  const [isPricingManagerOpen, setIsPricingManagerOpen] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);

  const { addProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState<Product>(product || initialProduct);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await dbOperations.getCategories();
      if (Array.isArray(loadedCategories)) {
        setCategories(loadedCategories);
      } else {
        setError("Invalid categories data");
      }
    } catch (err) {
      setError("Failed to load categories");
      console.error("Error loading categories:", err);
    }
  };
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>(
    {}
  );

  useEffect(() => {
    setFormData(product || initialProduct);
  }, [product]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Product, string>> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (formData.costPrice <= 0)
      newErrors.costPrice = "Cost price must be greater than 0";
    if (formData.stockQuantity < 0)
      newErrors.stockQuantity = "Stock quantity cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, barcode: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (product?.id) {
        await updateProduct({ ...formData, id: product.id });
      } else {
        await addProduct(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      if (error instanceof Error && error.name === "ConstraintError") {
        setErrors((prev) => ({
          ...prev,
          sku: "This SKU is already in use. Please enter a unique SKU.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Failed to save product. Please try again.",
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "costPrice" || name === "stockQuantity"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleBulkPricesChange = (prices: BulkPrice[]) => {
    setFormData((prev) => ({ ...prev, bulkPrices: prices }));
  };

  const handlePromotionChange = (promotion: Promotion | undefined) => {
    setFormData((prev) => ({ ...prev, promotion }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {product ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  error={!!errors.sku}
                  helperText={errors.sku}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid size={12}>
                <CategorySelector
                  categories={categories}
                  selectedCategoryId={formData.categoryId?.toString()}
                  onChange={(categoryId) => {
                    const selectedCategory = categories.find(
                      (cat) => cat.id === categoryId
                    );
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: categoryId ? Number(categoryId) : undefined,
                      category: selectedCategory ? selectedCategory.name : "",
                    }));
                  }}
                  placeholder="Select a category"
                  className="MuiOutlinedInput-root"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={6}>
                <Grid container spacing={1} alignItems="center">
                  <Grid size={10}>
                    <TextField
                      fullWidth
                      label="Barcode"
                      name="barcode"
                      value={formData.barcode || ""}
                      onChange={handleBarcodeChange}
                      placeholder="Enter barcode"
                    />
                  </Grid>
                  <Grid size={2}>
                    <IconButton
                      color="primary"
                      onClick={() => setIsBarcodeDialogOpen(true)}
                      title="Scan Barcode"
                    >
                      <QrCodeScannerIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              {formData.barcode && (
                <Grid size={12}>
                  <BarcodeGenerator value={formData.barcode} />
                </Grid>
              )}
              <Grid size={4}>
                <Grid container spacing={1} alignItems="center">
                  <Grid size={10}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      error={!!errors.price}
                      helperText={errors.price}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      required
                    />
                  </Grid>
                  <Grid size={2}>
                    <IconButton
                      color="primary"
                      onClick={() => setIsPricingManagerOpen(true)}
                      title="Manage Pricing"
                    >
                      <LocalOfferIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cost Price"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  error={!!errors.costPrice}
                  helperText={errors.costPrice}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  required
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock Quantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  error={!!errors.stockQuantity}
                  helperText={errors.stockQuantity}
                  InputProps={{ inputProps: { min: 0 } }}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {product ? "Update" : "Add"} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={isBarcodeDialogOpen}
        onClose={() => setIsBarcodeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Barcode</DialogTitle>
        <DialogContent>
          <BarcodeScanner
            onScan={(barcode) => {
              setFormData((prev) => ({ ...prev, barcode }));
              setIsBarcodeDialogOpen(false);
            }}
            onError={(error) => {
              console.error("Scanner error:", error);
              setIsBarcodeDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <PricingManager
        open={isPricingManagerOpen}
        onClose={() => setIsPricingManagerOpen(false)}
        bulkPrices={formData.bulkPrices || []}
        promotion={formData.promotion}
        onBulkPricesChange={handleBulkPricesChange}
        onPromotionChange={handlePromotionChange}
      />
    </>
  );
};

export default ProductForm;
