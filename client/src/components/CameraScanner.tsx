import { useRef, useEffect, useState } from 'react';
import { X, Camera, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (imageFile: File) => void;
}

export function CameraScanner({ isOpen, onClose, onImageCapture }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //@ts-ignore
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Start camera stream
  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Starting camera with facingMode:', facingMode);

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera permission with simpler constraints first
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', mediaStream);

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        console.log('Setting video srcObject');
        videoRef.current.srcObject = mediaStream;

        // Force video to load and play
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video playing successfully');
              setIsLoading(false);
            }).catch((playError) => {
              console.error('Error playing video:', playError);
              // Try to play without waiting
              try {
                videoRef.current?.play();
                setIsLoading(false);
              } catch (e) {
                setError('Failed to start video playback');
                setIsLoading(false);
              }
            });
          }
        };

        videoRef.current.oncanplay = () => {
          console.log('Video can play event fired');
          setIsLoading(false);
        };

        videoRef.current.onplay = () => {
          console.log('Video play event fired');
        };

        videoRef.current.onerror = (e) => {
          console.error('Video element error:', e);
          setError('Video playback error');
          setIsLoading(false);
        };

        // Immediate attempt to load
        try {
          videoRef.current.load();
        } catch (e) {
          console.log('Video load failed, trying direct play');
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setIsLoading(false);

      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan invoices.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera constraints not supported. Trying with basic settings...');
        // Try with basic constraints
        setTimeout(() => startCameraBasic(), 1000);
      } else {
        setError(`Failed to access camera: ${err.message}`);
      }
    }
  };

  // Fallback method with basic constraints
  const startCameraBasic = async () => {
    try {
      console.log('Trying basic camera constraints');
      const basicConstraints = {
        video: true,
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      console.log('Basic camera stream obtained:', mediaStream);

      setStream(mediaStream);
      setHasPermission(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().then(() => {
          console.log('Basic video playing successfully');
          setIsLoading(false);
        });
      }
    } catch (err: any) {
      console.error('Basic camera also failed:', err);
      setError('Unable to access any camera on this device');
      setIsLoading(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Capture image from video
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create data URL for preview
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
      }
    }, 'image/jpeg', 0.8);
  };

  // Confirm and send captured image
  const confirmCapture = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `invoice-scan-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onImageCapture(file);
        handleClose();
      }
    }, 'image/jpeg', 0.8);
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Handle modal close
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    setIsLoading(true);
    onClose();
  };

  // Effect to start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full h-full max-w-md mx-auto bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <h2 className="text-white text-lg font-semibold">Scan Invoice</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative w-full h-full">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-center">
                <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
              <div className="text-white text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">{error}</p>
                <Button onClick={startCamera} className="bg-white text-black hover:bg-gray-200">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured invoice"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Live Video Feed */}
          {!capturedImage && !error && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
                controls={false}
                style={{
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  backgroundColor: '#000',
                  display: isLoading ? 'none' : 'block'
                }}
                onCanPlay={() => {
                  console.log('Video can play - hiding loader');
                  setIsLoading(false);
                }}
                onLoadedData={() => {
                  console.log('Video loaded data');
                  setIsLoading(false);
                }}
                onError={(e) => {
                  console.error('Video error:', e);
                  setError('Video display error');
                }}
              />

              {/* Show loading overlay while video loads */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="text-white text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Loading camera...</p>
                  </div>
                </div>
              )}
              {/* Overlay guidelines */}
              {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                    <p className="text-white text-sm text-center bg-black/50 px-3 py-1 rounded">
                      Position invoice within frame
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          {capturedImage ? (
            // Preview controls
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={retakePhoto}
                variant="outline"
                size="lg"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Retake
              </Button>
              <Button
                onClick={confirmCapture}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-5 w-5 mr-2" />
                Use Photo
              </Button>
            </div>
          ) : (
            // Camera controls
            <div className="flex items-center justify-between">
              {/* Switch camera button */}
              <Button
                onClick={switchCamera}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                disabled={isLoading || !!error}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              {/* Capture button */}
              <Button
                onClick={captureImage}
                size="lg"
                className="bg-white hover:bg-gray-200 text-black rounded-full w-16 h-16 p-0"
                disabled={isLoading || !!error}
              >
                <Camera className="h-6 w-6" />
              </Button>

              {/* Placeholder for symmetry */}
              <div className="w-8"></div>
            </div>
          )}
        </div>

        {/* Camera facing indicator */}
        {!capturedImage && !isLoading && !error && (
          <div className="absolute top-16 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
          </div>
        )}
      </div>
    </div>
  );
}