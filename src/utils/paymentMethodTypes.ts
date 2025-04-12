export interface PaymentMethodField {
  name: string;
  type: "text" | "number";
  label: string;
  placeholder: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    pattern?: string;
    errorMessage?: string;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  fields: PaymentMethodField[];
  validate: (fieldValues: Record<string, string>) => {
    isValid: boolean;
    error?: string;
  };
}

export const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "Cash",
    fields: [
      {
        name: "amount",
        type: "number",
        label: "Cash Amount",
        placeholder: "Enter cash amount",
        validation: {
          required: true,
          min: 0,
          errorMessage: "Invalid cash amount",
        },
      },
    ],
    validate: (fieldValues) => {
      const amount = parseFloat(fieldValues.amount);
      if (isNaN(amount) || amount <= 0) {
        return { isValid: false, error: "Invalid cash amount" };
      }
      return { isValid: true };
    },
  },
  {
    id: "card",
    name: "Card",
    fields: [
      {
        name: "cardLastFourDigits",
        type: "text",
        label: "Last 4 Digits",
        placeholder: "Enter last 4 digits",
        validation: {
          required: true,
          minLength: 4,
          maxLength: 4,
          pattern: "^[0-9]{4}$",
          errorMessage: "Please enter 4 digits",
        },
      },
    ],
    validate: (fieldValues) => {
      if (!fieldValues.cardLastFourDigits?.match(/^[0-9]{4}$/)) {
        return { isValid: false, error: "Invalid card details" };
      }
      return { isValid: true };
    },
  },
  {
    id: "mobile",
    name: "Mobile Payment",
    fields: [
      {
        name: "mobilePaymentReference",
        type: "text",
        label: "Payment Reference",
        placeholder: "Enter payment reference",
        validation: {
          required: true,
          errorMessage: "Payment reference is required",
        },
      },
    ],
    validate: (fieldValues) => {
      if (!fieldValues.mobilePaymentReference) {
        return {
          isValid: false,
          error: "Mobile payment reference is required",
        };
      }
      return { isValid: true };
    },
  },
];
