import { useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const videoRef = document.getElementById("video") as HTMLVideoElement;

    const startScanning = async () => {
      if (!videoRef) {
        setError("Video element not found");
        return;
      }

      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setStream(stream);

        // Set up video element
        videoRef.srcObject = stream;
        await videoRef.play();

        // Start continuous scanning
        codeReader.decodeFromVideoElement(
          videoRef,
          (result) => {
            if (result) {
              onScan(result.getText());
            }
          },
          (err) => {
            if (err && onError) {
              onError(err);
            }
          }
        );
      } catch (err) {
        setError("Failed to access camera");
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    };

    startScanning();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef) {
        videoRef.srcObject = null;
      }
      codeReader.reset();
    };
  }, [onScan, onError]);

  return (
    <div className="barcode-scanner">
      <div className="camera-view">
        <video id="video" autoPlay playsInline />
      </div>
      {error && <div className="error-message">{error}</div>}
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
