import { useRef, useEffect, useState } from 'react';
import { X, Camera, RotateCcw, Check, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (imageFile: File) => void;
}

export function CameraScanner({ isOpen, onClose, onImageCapture }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'camera' | 'gallery'>('camera');
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

  // Handle file selection from gallery
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (e.g., max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError('Image size too large. Please select an image under 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCapturedImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open file picker
  const openGallery = () => {
    fileInputRef.current?.click();
  };

  // Switch between camera and gallery modes
  const switchMode = (newMode: 'camera' | 'gallery') => {
    setMode(newMode);
    setCapturedImage(null);
    setSelectedFile(null);
    setError(null);

    if (newMode === 'camera') {
      setIsLoading(true);
      startCamera();
    } else {
      stopCamera();
      setIsLoading(false);
    }
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

        // Create file for later use
        const file = new File([blob], `invoice-scan-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        setSelectedFile(file);
      }
    }, 'image/jpeg', 0.8);
  };

  // Confirm and send captured/selected image
  const confirmCapture = () => {
    if (selectedFile) {
      onImageCapture(selectedFile);
      handleClose();
    } else if (mode === 'camera' && canvasRef.current) {
      // Fallback for camera mode
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `invoice-scan-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onImageCapture(file);
          handleClose();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setError(null);

    if (mode === 'camera') {
      // Don't need to restart camera, it's still running
    } else {
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setSelectedFile(null);
    setError(null);
    setIsLoading(true);
    setMode('camera');

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onClose();
  };

  // Effect to start camera when modal opens
  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else if (!isOpen) {
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
          <h2 className="text-white text-lg font-semibold">
            {mode === 'camera' ? 'Scan Invoice' : 'Select Invoice'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="absolute top-16 left-4 right-4 z-10 flex bg-black/50 rounded-lg p-1">
          <Button
            variant={mode === 'camera' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => switchMode('camera')}
            className={`flex-1 ${mode === 'camera'
              ? 'bg-white text-black hover:bg-gray-200'
              : 'text-white hover:bg-white/20'
              }`}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={mode === 'gallery' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => switchMode('gallery')}
            className={`flex-1 ${mode === 'gallery'
              ? 'bg-white text-black hover:bg-gray-200'
              : 'text-white hover:bg-white/20'
              }`}
          >
            <Image className="h-4 w-4 mr-2" />
            Gallery
          </Button>
        </div>

        {/* Main Content */}
        <div className="relative w-full h-full">
          {/* Loading State */}
          {isLoading && mode === 'camera' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-center">
                <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black p-6 mt-20">
              <div className="text-white text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">{error}</p>
                {mode === 'camera' && (
                  <Button onClick={startCamera} className="bg-white text-black hover:bg-gray-200">
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Captured/Selected Image Preview */}
          {capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black mt-20">
              <img
                src={capturedImage}
                alt="Selected invoice"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Gallery Mode - No Image Selected */}
          {mode === 'gallery' && !capturedImage && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black mt-20">
              <div className="text-white text-center">
                <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="mb-4 text-lg">Select an invoice image</p>
                <p className="text-sm text-gray-300 mb-6">Choose an image from your device gallery</p>
                <Button
                  onClick={openGallery}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>
          )}

          {/* Camera Mode - Live Video Feed */}
          {mode === 'camera' && !capturedImage && !error && (
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

              {/* Overlay guidelines */}
              {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-20">
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
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
                {mode === 'camera' ? 'Retake' : 'Choose Again'}
              </Button>
              <Button
                onClick={confirmCapture}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-5 w-5 mr-2" />
                Use Image
              </Button>
            </div>
          ) : mode === 'camera' ? (
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
          ) : (
            // Gallery controls
            <div className="flex items-center justify-center">
              <Button
                onClick={openGallery}
                size="lg"
                className="bg-white hover:bg-gray-200 text-black"
                disabled={!!error}
              >
                <Upload className="h-5 w-5 mr-2" />
                Select Image
              </Button>
            </div>
          )}
        </div>

        {/* Camera facing indicator */}
        {mode === 'camera' && !capturedImage && !isLoading && !error && (
          <div className="absolute top-28 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
          </div>
        )}
      </div>
    </div>
  );
}