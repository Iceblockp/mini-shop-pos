export interface PaymentDetails {
  method: "cash" | "card" | "mobile";
  amount: number;
  change?: number;
  cardLastFourDigits?: string;
  mobilePaymentReference?: string;
}

export interface TransactionItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id?: number;
  items: TransactionItem[];
  totalAmount: number;
  payment: PaymentDetails;
  timestamp: Date;
  status: "completed" | "cancelled" | "refunded";
  customerId?: string;
  notes?: string;
}
