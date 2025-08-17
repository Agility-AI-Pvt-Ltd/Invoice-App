import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Camera,
  X,
  RotateCcw,
  Check,
  ScanLine,
  AlertCircle
} from "lucide-react";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (imageFile: File) => void;
}

export function CameraScanner({ isOpen, onClose, onImageCapture }: CameraScannerProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      let stream: MediaStream | null = null;

      try {
        // First try back camera (mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { exact: "environment" }
          }
        });
      } catch (err) {
        console.warn("Back camera not available, falling back to default camera:", err);

        // Fallback: default camera (usually laptop webcam)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please ensure camera permissions are granted.");
    }
  }, []);


  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCapturedImage(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageDataUrl);

    // Stop the camera stream
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(async () => {
    if (!capturedImage || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create file object
      const file = new File([blob], `invoice-scan-${Date.now()}.jpg`, {
        type: "image/jpeg"
      });

      // Call the parent component's callback with the image file
      onImageCapture(file);

      // Close the scanner
      handleClose();
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process the captured image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, onImageCapture, onClose]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when component opens
  useEffect(() => {
    if (isOpen && !isStreaming && !capturedImage) {
      startCamera();
    }
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isStreaming, capturedImage, startCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Scan Invoice</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Camera/Image Display */}
          <div className="relative mb-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              {/* Video Stream */}
              {isStreaming && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* Captured Image */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured invoice"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Loading State */}
              {!isStreaming && !capturedImage && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Starting camera...</p>
                  </div>
                </div>
              )}

              {/* Scanning Overlay */}
              {isStreaming && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-70">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    Position invoice within the frame
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {isStreaming && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </>
            )}

            {capturedImage && (
              <>
                <Button variant="outline" onClick={retakePhoto}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={confirmPhoto}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Use This Photo"}
                </Button>
              </>
            )}

            {error && !isStreaming && !capturedImage && (
              <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tips for best results:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
              <li>Ensure good lighting</li>
              <li>Keep the invoice flat and straight</li>
              <li>Fill the frame with the invoice</li>
              <li>Avoid shadows and glare</li>
            </ul>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
        />
      </Card>
    </div>
  );
}