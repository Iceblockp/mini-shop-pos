import { useState } from "react";
import { BarcodeScanner } from "./BarcodeScanner";
import { Product } from "../utils/database";
import { useProducts } from "../contexts/ProductContext";
import { CheckoutDialog } from "./CheckoutDialog";

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export const SalesPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerActive, setScannerActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string>("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { products, searchProducts } = useProducts();

  const handleBarcodeScan = async (barcode: string) => {
    try {
      await searchProducts(barcode);
      const product = products.find((p) => p.barcode === barcode);

      if (!product) {
        setError("Product not found");
        return;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.barcode === barcode);
        if (existingItem) {
          return prevCart.map((item) =>
            item.barcode === barcode
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.price,
                }
              : item
          );
        }
        return [
          ...prevCart,
          { ...product, quantity: 1, subtotal: product.price },
        ];
      });
      setError("");
    } catch (err) {
      setError("Failed to add product to cart");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="sales-page">
      <div className="scanner-section">
        <div className="mode-selector">
          <button
            className={`mode-button ${scannerActive ? "active" : ""}`}
            onClick={() => setScannerActive(true)}
          >
            Scan Barcode
          </button>
          <button
            className={`mode-button ${!scannerActive ? "active" : ""}`}
            onClick={() => {
              setScannerActive(false);
            }}
          >
            Search Products
          </button>
        </div>
        {scannerActive ? (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(err) => setError(err.message)}
          />
        ) : (
          <div className="product-search-section">
            <input
              type="text"
              placeholder="Search by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
            <div className="product-list">
              {products
                .filter(
                  (product) =>
                    product.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    product.barcode
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((product) => (
                  <div
                    key={product.barcode}
                    className="product-item"
                    onClick={() => {
                      setCart((prevCart) => {
                        const existingItem = prevCart.find(
                          (item) => item.id === product.id
                        );
                        if (existingItem) {
                          return prevCart.map((item) =>
                            item.id === product.id
                              ? {
                                  ...item,
                                  quantity: item.quantity + 1,
                                  subtotal: (item.quantity + 1) * item.price,
                                }
                              : item
                          );
                        }
                        return [
                          ...prevCart,
                          { ...product, quantity: 1, subtotal: product.price },
                        ];
                      });
                      setError("");
                    }}
                  >
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="cart-section">
        <h2>Shopping Cart</h2>
        <div className="cart-header">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
          <span>Action</span>
        </div>
        {cart.map((item) => (
          <div key={item.barcode} className="cart-item">
            <span className="item-name">{item.name}</span>
            <span className="item-unit-price">${item.price.toFixed(2)}</span>
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => {
                  if (item.quantity > 1) {
                    setCart((prevCart) =>
                      prevCart.map((cartItem) =>
                        cartItem.barcode === item.barcode
                          ? {
                              ...cartItem,
                              quantity: cartItem.quantity - 1,
                              subtotal:
                                (cartItem.quantity - 1) * cartItem.price,
                            }
                          : cartItem
                      )
                    );
                  }
                }}
              >
                -
              </button>
              <span className="item-quantity">{item.quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => {
                  setCart((prevCart) =>
                    prevCart.map((cartItem) =>
                      cartItem.barcode === item.barcode
                        ? {
                            ...cartItem,
                            quantity: cartItem.quantity + 1,
                            subtotal: (cartItem.quantity + 1) * cartItem.price,
                          }
                        : cartItem
                    )
                  );
                }}
              >
                +
              </button>
            </div>
            <span className="item-subtotal">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              className="remove-btn"
              onClick={() => {
                setCart((prevCart) =>
                  prevCart.filter(
                    (cartItem) => cartItem.barcode !== item.barcode
                  )
                );
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="cart-footer">
          <div className="cart-total">
            <strong>Total:</strong> ${calculateTotal().toFixed(2)}
          </div>
          <button
            className="checkout-button"
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalAmount={calculateTotal()}
        onCheckoutComplete={() => {
          setCart([]);
          setError("");
        }}
      />

      <style>
        {`
          .sales-page {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            padding: 1rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          .scanner-section {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .product-search-section {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            height: 100%;
          }

          .search-input {
            margin-bottom: 1rem;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
          }

          .product-list {
            flex-grow: 1;
            overflow-y: auto;
            padding: 0.5rem;
            background: white;
            border-radius: 4px;
            border: 1px solid #ddd;
          }

          .product-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            border: 1px solid #eee;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: background-color 0.2s;
            background: white;
          }

          .product-item:hover {
            background-color: #f5f5f5;
          }

          .product-name {
            font-weight: 500;
          }

          .product-price {
            color: #2196f3;
            font-weight: 500;
          }

          .mode-selector {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .mode-button {
            flex: 1;
            padding: 0.5rem;
            border: none;
            border-radius: 4px;
            background: #e0e0e0;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .mode-button.active {
            background: #2196f3;
            color: white;
          }

          .search-button {
            width: 100%;
            padding: 1rem;
            background: #2196f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.2s;
          }

          .search-button:hover {
            background: #1976d2;
          }

          .cart-section {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .cart-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
            gap: 1rem;
            padding: 0.5rem;
            background: #f5f5f5;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            font-weight: bold;
          }

          .cart-item {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
            gap: 1rem;
            align-items: center;
            padding: 0.75rem 0.5rem;
            border-bottom: 1px solid #eee;
          }

          .quantity-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .quantity-btn {
            width: 24px;
            height: 24px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          }

          .quantity-btn:hover {
            background: #f5f5f5;
          }

          .remove-btn {
            padding: 0.25rem 0.5rem;
            border: none;
            border-radius: 4px;
            background: #ff4444;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .remove-btn:hover {
            background: #cc0000;
          }

          .cart-footer {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 2px solid #eee;
          }

          .cart-total {
            text-align: right;
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }

          .checkout-button {
            width: 100%;
            padding: 1rem;
            background: #2196f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.2s;
          }

          .checkout-button:hover {
            background: #1976d2;
          }

          .checkout-button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          .item-unit-price,
          .item-subtotal {
            color: #2196f3;
            font-weight: 500;
          }

          .error-message {
            color: #ff4444;
            text-align: center;
            margin-top: 1rem;
            grid-column: 1 / -1;
          }

          @media (max-width: 768px) {
            .sales-page {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};
