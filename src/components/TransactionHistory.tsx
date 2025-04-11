import React, { useState } from "react";
import { TransactionList } from "./TransactionList";
import { Transaction } from "../utils/transactionTypes";

export const TransactionHistory: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="transaction-history">
      <h1>Transaction History</h1>

      <div className="content-wrapper">
        <div className="main-content">
          <TransactionList onTransactionSelect={handleTransactionSelect} />
        </div>

        {selectedTransaction && (
          <div className="transaction-details">
            <h2>Transaction Details</h2>
            <div className="details-content">
              <div className="detail-row">
                <span>Date:</span>
                <span>
                  {new Date(selectedTransaction.timestamp).toLocaleDateString()}{" "}
                  {new Date(selectedTransaction.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="detail-row">
                <span>Total Amount:</span>
                <span>${selectedTransaction.totalAmount.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span>Payment Method:</span>
                <span>{selectedTransaction.payment.method}</span>
              </div>
              {selectedTransaction.payment.method === "cash" && (
                <div className="detail-row">
                  <span>Change:</span>
                  <span>${selectedTransaction.payment.change?.toFixed(2)}</span>
                </div>
              )}
              {selectedTransaction.payment.method === "card" && (
                <div className="detail-row">
                  <span>Card:</span>
                  <span>
                    ****{selectedTransaction.payment.cardLastFourDigits}
                  </span>
                </div>
              )}
              {selectedTransaction.payment.method === "mobile" && (
                <div className="detail-row">
                  <span>Reference:</span>
                  <span>
                    {selectedTransaction.payment.mobilePaymentReference}
                  </span>
                </div>
              )}

              <h3>Items</h3>
              <div className="items-list">
                {selectedTransaction.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <span className="item-name">{item.name}</span>
                    <div className="item-details">
                      <span>
                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                      </span>
                      <span className="item-subtotal">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .transaction-history {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          h1 {
            margin-bottom: 2rem;
            color: #333;
          }

          .content-wrapper {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2rem;
            align-items: start;
          }

          .main-content {
            min-width: 0;
          }

          .transaction-details {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            width: 300px;
          }

          .transaction-details h2 {
            margin-bottom: 1.5rem;
            color: #333;
          }

          .transaction-details h3 {
            margin: 1.5rem 0 1rem;
            color: #333;
          }

          .details-content {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
          }

          .detail-row span:first-child {
            color: #666;
          }

          .detail-row span:last-child {
            font-weight: 500;
          }

          .items-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .item-row {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
          }

          .item-name {
            font-weight: 500;
          }

          .item-details {
            display: flex;
            justify-content: space-between;
            color: #666;
            font-size: 0.9rem;
          }

          .item-subtotal {
            color: #2196f3;
            font-weight: 500;
          }

          @media (max-width: 768px) {
            .content-wrapper {
              grid-template-columns: 1fr;
            }

            .transaction-details {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};
