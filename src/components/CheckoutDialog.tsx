import React, { useState, useEffect } from "react";
import { CartItem } from "./SalesPage";
import {
  PaymentDetails,
  Transaction,
  TransactionItem,
} from "../utils/transactionTypes";
import { dbOperations } from "../utils/database";
import {
  PaymentMethod,
  defaultPaymentMethods,
} from "../utils/paymentMethodTypes";
import { useProducts } from "../contexts/ProductContext";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalAmount: number;
  onCheckoutComplete: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  cart,
  totalAmount,
  onCheckoutComplete,
}) => {
  // const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
  //   PaymentMethod[]
  // >(defaultPaymentMethods);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(defaultPaymentMethods[0]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { refreshProducts } = useProducts();

  useEffect(() => {
    if (selectedPaymentMethod.id === "cash") {
      setFieldValues({ amount: totalAmount.toString() });
    } else {
      setFieldValues({});
    }
  }, [selectedPaymentMethod, totalAmount]);

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      setError("");

      // Validate payment details
      const validationResult = selectedPaymentMethod.validate(fieldValues);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error || "Invalid payment details");
      }

      const paymentDetails: PaymentDetails = {
        method: selectedPaymentMethod.id as PaymentDetails["method"],
        amount: totalAmount,
        ...fieldValues,
      };

      // Calculate change for cash payments
      if (selectedPaymentMethod.id === "cash") {
        const cashPaid = parseFloat(fieldValues.amount);
        if (cashPaid < totalAmount) {
          throw new Error(
            "Cash amount must be greater than or equal to total amount"
          );
        }
        paymentDetails.change = cashPaid - totalAmount;
      }

      // Create transaction items from cart
      const transactionItems: TransactionItem[] = cart.map((item) => ({
        productId: item.id!,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.subtotal,
      }));

      // Create transaction record
      const transaction: Transaction = {
        items: transactionItems,
        totalAmount,
        payment: paymentDetails,
        timestamp: new Date(),
        status: "completed",
      };

      // Validate stock quantities before proceeding
      const products = await dbOperations.getAllProducts();
      for (const item of cart) {
        const product = products.find((p) => p.id === item.id);
        if (!product) {
          throw new Error(`Product ${item.name} not found`);
        }

        const currentStock = product.stockQuantity;

        if (typeof currentStock !== "number" || currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.name}. Only ${currentStock} units available.`
          );
        }
      }

      // Save transaction and update inventory
      await dbOperations.createTransaction(transaction);

      // Refresh products to update stock quantities in UI
      await refreshProducts();

      onCheckoutComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="checkout-dialog-overlay">
      <div className="checkout-dialog">
        <h2>Checkout</h2>

        <div className="cart-summary">
          <h3>Cart Summary</h3>
          {cart.map((item) => {
            const itemKey = `${item.id}`;
            return (
              <div key={itemKey} className="summary-item">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            );
          })}
          <div className="total-amount">
            <strong>Total Amount:</strong>
            <strong>${totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className="payment-section">
          <h3>Payment Method</h3>
          <div className="payment-methods">
            {defaultPaymentMethods.map((method) => (
              <button
                key={method.id}
                className={`method-button ${
                  selectedPaymentMethod.id === method.id ? "active" : ""
                }`}
                onClick={() => setSelectedPaymentMethod(method)}
              >
                {method.name}
              </button>
            ))}
          </div>

          <div className="payment-details">
            {selectedPaymentMethod.fields.map((field) => (
              <label key={field.name}>
                {field.label}:
                <input
                  type={field.type}
                  value={fieldValues[field.name] || ""}
                  onChange={(e) =>
                    setFieldValues({
                      ...fieldValues,
                      [field.name]: e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  {...(field.validation || {})}
                />
                {field.validation?.errorMessage &&
                  fieldValues[field.name] &&
                  !selectedPaymentMethod.validate({
                    [field.name]: fieldValues[field.name],
                  }).isValid && (
                    <div className="field-error">
                      {field.validation.errorMessage}
                    </div>
                  )}
              </label>
            ))}
            {selectedPaymentMethod.id === "cash" && fieldValues.amount && (
              <div className="change-amount">
                Change: $
                {(parseFloat(fieldValues.amount) - totalAmount).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dialog-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
          >
            {processing ? "Processing..." : "Complete Checkout"}
          </button>
        </div>

        <style>
          {`
            .checkout-dialog-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1000;
            }

            .checkout-dialog {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              width: 90%;
              max-width: 600px;
              max-height: 90vh;
              overflow-y: auto;
            }

            .cart-summary {
              margin: 1rem 0;
              padding: 1rem;
              background: #f5f5f5;
              border-radius: 4px;
            }

            .summary-item {
              display: flex;
              justify-content: space-between;
              margin: 0.5rem 0;
            }

            .total-amount {
              display: flex;
              justify-content: space-between;
              margin-top: 1rem;
              padding-top: 1rem;
              border-top: 2px solid #eee;
            }

            .payment-section {
              margin: 1rem 0;
            }

            .payment-methods {
              display: flex;
              gap: 1rem;
              margin: 1rem 0;
            }

            .method-button {
              flex: 1;
              padding: 0.5rem;
              border: none;
              border-radius: 4px;
              background: #e0e0e0;
              cursor: pointer;
              transition: background-color 0.2s;
            }

            .method-button.active {
              background: #2196f3;
              color: white;
            }

            .payment-details {
              margin: 1rem 0;
            }

            .payment-details label {
              display: block;
              margin-bottom: 0.5rem;
            }

            .payment-details input {
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              margin-top: 0.25rem;
            }

            .change-amount {
              margin-top: 0.5rem;
              color: #2196f3;
              font-weight: 500;
            }

            .dialog-actions {
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
              margin-top: 2rem;
            }

            .cancel-button,
            .checkout-button {
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.2s;
            }

            .cancel-button {
              background: #e0e0e0;
            }

            .checkout-button {
              background: #2196f3;
              color: white;
            }

            .checkout-button:disabled {
              background: #ccc;
              cursor: not-allowed;
            }

            .error-message {
              color: #ff4444;
              margin-top: 1rem;
              text-align: center;
            }
          `}
        </style>
      </div>
    </div>
  );
};
