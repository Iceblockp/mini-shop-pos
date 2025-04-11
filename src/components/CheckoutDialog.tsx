import React, { useState } from "react";
import { CartItem } from "./SalesPage";
import {
  PaymentDetails,
  Transaction,
  TransactionItem,
} from "../utils/transactionTypes";
import { dbOperations } from "../utils/database";

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
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentDetails["method"]>("cash");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [cardLastFourDigits, setCardLastFourDigits] = useState<string>("");
  const [mobilePaymentRef, setMobilePaymentRef] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      setError("");

      let paymentDetails: PaymentDetails = {
        method: paymentMethod,
        amount: totalAmount,
      };

      // Validate payment details based on method
      if (paymentMethod === "cash") {
        const cashPaid = parseFloat(cashAmount);
        if (isNaN(cashPaid) || cashPaid < totalAmount) {
          throw new Error("Invalid cash amount");
        }
        paymentDetails.amount = cashPaid;
        paymentDetails.change = cashPaid - totalAmount;
      } else if (paymentMethod === "card") {
        if (!cardLastFourDigits || cardLastFourDigits.length !== 4) {
          throw new Error("Invalid card details");
        }
        paymentDetails.cardLastFourDigits = cardLastFourDigits;
      } else if (paymentMethod === "mobile") {
        if (!mobilePaymentRef) {
          throw new Error("Mobile payment reference is required");
        }
        paymentDetails.mobilePaymentReference = mobilePaymentRef;
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

      // Save transaction and update inventory
      await dbOperations.createTransaction(transaction);

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
          {cart.map((item) => (
            <div key={item.id} className="summary-item">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="total-amount">
            <strong>Total Amount:</strong>
            <strong>${totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className="payment-section">
          <h3>Payment Method</h3>
          <div className="payment-methods">
            <button
              className={`method-button ${
                paymentMethod === "cash" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("cash")}
            >
              Cash
            </button>
            <button
              className={`method-button ${
                paymentMethod === "card" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              Card
            </button>
            <button
              className={`method-button ${
                paymentMethod === "mobile" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("mobile")}
            >
              Mobile Payment
            </button>
          </div>

          {paymentMethod === "cash" && (
            <div className="payment-details">
              <label>
                Cash Amount:
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Enter cash amount"
                  min={totalAmount}
                  step="0.01"
                />
              </label>
              {cashAmount && (
                <div className="change-amount">
                  Change: ${(parseFloat(cashAmount) - totalAmount).toFixed(2)}
                </div>
              )}
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="payment-details">
              <label>
                Last 4 Digits:
                <input
                  type="text"
                  value={cardLastFourDigits}
                  onChange={(e) =>
                    setCardLastFourDigits(
                      e.target.value.replace(/\D/g, "").slice(0, 4)
                    )
                  }
                  placeholder="Enter last 4 digits"
                  maxLength={4}
                />
              </label>
            </div>
          )}

          {paymentMethod === "mobile" && (
            <div className="payment-details">
              <label>
                Payment Reference:
                <input
                  type="text"
                  value={mobilePaymentRef}
                  onChange={(e) => setMobilePaymentRef(e.target.value)}
                  placeholder="Enter payment reference"
                />
              </label>
            </div>
          )}
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
