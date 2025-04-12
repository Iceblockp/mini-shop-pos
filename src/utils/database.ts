import { Transaction } from "./transactionTypes";
import { Category } from "./categoryTypes";

// Define the Product interface
export interface BulkPrice {
  quantity: number;
  price: number;
}

export interface Promotion {
  startDate: Date;
  endDate: Date;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
  categoryId?: number;
  stockQuantity: number;
  imageUrl?: string;
  costPrice: number;
  supplier?: string;
  bulkPrices?: BulkPrice[];
  promotion?: Promotion;
  barcode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Initialize IndexedDB
const dbName = "posDB";
const dbVersion = 8;
const productStoreName = "products";
const inventoryMovementStoreName = "inventoryMovements";
const transactionStoreName = "transactions";
const categoryStoreName = "categories";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(productStoreName)) {
        const store = db.createObjectStore(productStoreName, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("sku", "sku", { unique: true });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("price", "price", { unique: false });
        store.createIndex("promotion", "promotion", { unique: false });
      }

      if (!db.objectStoreNames.contains(inventoryMovementStoreName)) {
        const movementStore = db.createObjectStore(inventoryMovementStoreName, {
          keyPath: "id",
          autoIncrement: true,
        });
        movementStore.createIndex("productId", "productId", { unique: false });
        movementStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains(transactionStoreName)) {
        const transactionStore = db.createObjectStore(transactionStoreName, {
          keyPath: "id",
          autoIncrement: true,
        });
        transactionStore.createIndex("timestamp", "timestamp", {
          unique: false,
        });
        transactionStore.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(categoryStoreName)) {
        const categoryStore = db.createObjectStore(categoryStoreName, {
          keyPath: "id",
          autoIncrement: true,
        });
        categoryStore.createIndex("name", "name", { unique: true });
        categoryStore.createIndex("parentId", "parentId", { unique: false });
      }
    };
  });
};

// Database operations
export const dbOperations = {
  // Create a new product
  createProduct: async (product: Product): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(productStoreName, "readwrite");
      const store = transaction.objectStore(productStoreName);
      const request = store.add({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(productStoreName, "readonly");
      const store = transaction.objectStore(productStoreName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Get product by ID
  getProductById: async (id: number): Promise<Product | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(productStoreName, "readonly");
      const store = transaction.objectStore(productStoreName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Update product
  updateProduct: async (product: Product): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      // First update the product
      const productTransaction = db.transaction(productStoreName, "readwrite");
      const store = productTransaction.objectStore(productStoreName);

      const request = store.put({
        ...product,
        updatedAt: new Date(),
      });

      request.onsuccess = () => resolve();

      request.onerror = () => reject(request.error);

      productTransaction.onerror = () => {
        reject(new Error("Failed to update product"));
      };
    });
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(productStoreName, "readwrite");
      const store = transaction.objectStore(productStoreName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    const products = await dbOperations.getAllProducts();
    const searchQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.sku.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        product.barcode?.toLocaleLowerCase().includes(searchQuery)
    );
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(productStoreName, "readonly");
      const store = transaction.objectStore(productStoreName);
      const index = store.index("category");
      const request = index.getAll(category);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Update stock quantity with movement tracking
  updateStockQuantity: async (
    id: number,
    quantity: number,
    reason: string,
    adjustmentType: "add" | "remove"
  ): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(
      [productStoreName, inventoryMovementStoreName],
      "readwrite"
    );

    try {
      const productStore = transaction.objectStore(productStoreName);
      const movementStore = transaction.objectStore(inventoryMovementStoreName);

      const product = await new Promise<Product>((resolve, reject) => {
        const request = productStore.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!product) throw new Error("Product not found");

      const previousStock = product.stockQuantity;
      product.stockQuantity += quantity;

      // Record the movement
      const movement = {
        productId: id,
        adjustmentType,
        quantity: Math.abs(quantity),
        reason,
        previousStock,
        newStock: product.stockQuantity,
        timestamp: new Date(),
      };

      await new Promise<void>((resolve, reject) => {
        const updateRequest = productStore.put(product);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      });

      await new Promise<void>((resolve, reject) => {
        const movementRequest = movementStore.add(movement);
        movementRequest.onsuccess = () => resolve();
        movementRequest.onerror = () => reject(movementRequest.error);
      });

      // Check for low stock after update
      if (product.stockQuantity <= 10) {
        // Threshold can be customized
        console.warn(
          `Low stock alert for ${product.name}: ${product.stockQuantity} items remaining`
        );
      }
    } catch (error) {
      transaction.abort();
      throw error;
    }
  },

  // Get inventory movements for a product
  getInventoryMovements: async (productId: number): Promise<any[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        inventoryMovementStoreName,
        "readonly"
      );
      const store = transaction.objectStore(inventoryMovementStoreName);
      const index = store.index("productId");
      const request = index.getAll(productId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Create a new transaction
  createTransaction: async (transaction: Transaction): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(
      [transactionStoreName, productStoreName],
      "readwrite"
    );

    try {
      // Update product stock quantities
      const productStore = tx.objectStore(productStoreName);
      for (const item of transaction.items) {
        const productRequest = productStore.get(item.productId);
        await new Promise((resolve, reject) => {
          productRequest.onsuccess = () => {
            const product = productRequest.result;
            if (!product)
              throw new Error(`Product not found: ${item.productId}`);
            if (product.stockQuantity < item.quantity) {
              throw new Error(
                `Insufficient stock for product: ${product.name}`
              );
            }
            product.stockQuantity -= item.quantity;
            productStore.put(product);
            resolve(null);
          };
          productRequest.onerror = () => reject(productRequest.error);
        });
      }

      // Save the transaction
      const transactionStore = tx.objectStore(transactionStoreName);
      await new Promise<void>((resolve, reject) => {
        const request = transactionStore.add(transaction);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      tx.abort();
      throw error;
    }
  },

  // Get all transactions
  getAllTransactions: async (): Promise<Transaction[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(transactionStoreName, "readonly");
      const store = transaction.objectStore(transactionStoreName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Get transaction by ID
  getTransactionById: async (id: number): Promise<Transaction | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(transactionStoreName, "readonly");
      const store = transaction.objectStore(transactionStoreName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Category Operations
  createCategory: async (category: Category): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(categoryStoreName, "readwrite");
      const store = transaction.objectStore(categoryStoreName);
      const request = store.add({
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getCategories: async (): Promise<Category[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(categoryStoreName, "readonly");
      const store = transaction.objectStore(categoryStoreName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  updateCategory: async (category: Category): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(categoryStoreName, "readwrite");
      const store = transaction.objectStore(categoryStoreName);
      const request = store.put({
        ...category,
        updatedAt: new Date(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(categoryStoreName, "readwrite");
      const store = transaction.objectStore(categoryStoreName);
      const request = store.delete(categoryId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};
