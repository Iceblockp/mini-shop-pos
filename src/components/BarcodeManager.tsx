import { useState } from "react";
import { BarcodeScanner } from "./BarcodeScanner";
import { BarcodeGenerator } from "./BarcodeGenerator";
import { Product } from "../utils/database";

interface BarcodeManagerProps {
  onBarcodeScanned: (barcode: string) => void;
  product?: Product;
}

export const BarcodeManager: React.FC<BarcodeManagerProps> = ({
  onBarcodeScanned,
  product,
}) => {
  const [mode, setMode] = useState<"scan" | "generate">("scan");
  const [error, setError] = useState<string>("");

  const handleScanError = (error: Error) => {
    setError(error.message);
  };

  return (
    <div className="barcode-manager">
      <div className="mode-selector">
        <button
          className={`mode-button ${mode === "scan" ? "active" : ""}`}
          onClick={() => setMode("scan")}
        >
          Scan Barcode
        </button>
        <button
          className={`mode-button ${mode === "generate" ? "active" : ""}`}
          onClick={() => setMode("generate")}
        >
          Generate Barcode
        </button>
      </div>

      {mode === "scan" ? (
        <BarcodeScanner onScan={onBarcodeScanned} onError={handleScanError} />
      ) : (
        product?.barcode && (
          <BarcodeGenerator
            value={product.barcode}
            width={2}
            height={100}
            displayValue={true}
          />
        )
      )}

      {error && <div className="error-message">{error}</div>}

      <style>
        {`
          .barcode-manager {
            padding: 1rem;
            background: #f5f5f5;
            border-radius: 8px;
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
          .error-message {
            color: #ff4444;
            text-align: center;
            margin-top: 1rem;
          }
        `}
      </style>
    </div>
  );
};
