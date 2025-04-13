import { useEffect, useState } from "react";
import { useZxing } from "react-zxing";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  // onError,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  // const [error, setError] = useState<string>("");
  const scanSound = new Audio("/src/assets/sounds/scan.mp3");

  const { ref } = useZxing({
    onDecodeResult(result) {
      const text = result.getText();
      if (text && text.length > 0) {
        scanSound.play();
        onScan(text);
      }
    },
  });

  useEffect(() => {
    setIsScanning(true);
    return () => {
      setIsScanning(false);
    };
  }, []);

  return (
    <div className="barcode-scanner">
      <div className="camera-view">
        <video ref={ref} autoPlay playsInline />
        <div className="scanning-overlay">
          <div className="scanning-line" />
        </div>
        {isScanning && (
          <div className="scanning-hint">Position barcode within frame</div>
        )}
      </div>
      {/* {error && <div className="error-message">{error}</div>} */}
      <style>
        {`
          .barcode-scanner {
            width: 100%;
            max-width: 640px;
            margin: 0 auto;
          }
          .camera-view {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            background: #000;
            overflow: hidden;
            border-radius: 8px;
          }
          .camera-view video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .scanning-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 200px;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 10px;
          }
          .scanning-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: #2196f3;
            animation: scan 2s linear infinite;
          }
          @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
          }
          .scanning-hint {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
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
