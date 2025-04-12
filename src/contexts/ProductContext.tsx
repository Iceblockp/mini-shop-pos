import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Product, dbOperations } from "../utils/database";
import { InventoryMovement } from "../utils/inventoryTypes";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  searchProducts: (query: string) => void;
  resetSearch: () => void;
  updateStockQuantity: (
    id: number,
    quantity: number,
    reason: string,
    adjustmentType: "add" | "remove"
  ) => Promise<void>;
  getInventoryMovements: (productId: number) => Promise<InventoryMovement[]>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await dbOperations.getAllProducts();
      setProducts(fetchedProducts);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Product) => {
    try {
      await dbOperations.createProduct(product);
      await refreshProducts();
    } catch (err) {
      if (err instanceof Error && err.name === "ConstraintError") {
        setError(
          "A product with this SKU already exists. Please use a unique SKU."
        );
      } else {
        setError("Failed to add product");
      }
      console.error("Error adding product:", err);
      throw err; // Re-throw the error to handle it in the form component
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      await dbOperations.updateProduct(product);
      await refreshProducts();
    } catch (err) {
      setError("Failed to update product");
      console.error("Error updating product:", err);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await dbOperations.deleteProduct(id);
      await refreshProducts();
    } catch (err) {
      setError("Failed to delete product");
      console.error("Error deleting product:", err);
    }
  };

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      const searchResults = await dbOperations.searchProducts(query);
      setProducts(searchResults);
      setError(null);
    } catch (err) {
      setError("Failed to search products");
      console.error("Error searching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const updateStockQuantity = async (
    id: number,
    quantity: number,
    reason: string,
    adjustmentType: "add" | "remove"
  ) => {
    try {
      await dbOperations.updateStockQuantity(
        id,
        quantity,
        reason,
        adjustmentType
      );
      await refreshProducts();
    } catch (err) {
      setError("Failed to update stock quantity");
      throw err;
    }
  };

  const getInventoryMovements = async (productId: number) => {
    try {
      return await dbOperations.getInventoryMovements(productId);
    } catch (err) {
      setError("Failed to fetch inventory movements");
      console.error("Error fetching inventory movements:", err);
      return [];
    }
  };

  const resetSearch = useCallback(() => {
    refreshProducts();
  }, []);

  const value = {
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    resetSearch,
    updateStockQuantity,
    getInventoryMovements,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
