import React, { useRef, useEffect, useState } from 'react';
import { Modal, Box, Button } from '@mui/material';

interface CameraPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '400px',
  height: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const CameraPanel: React.FC<CameraPanelProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        })
        .catch(error => console.error("Error accessing camera:", error));
    } else {
      cleanupStream();
    }

    return () => {
      cleanupStream();
    };
  }, [isOpen]);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        onCapture(imageData);
      }
    }
    cleanupStream();
  };

  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={{ ...modalStyle, width: '400px', height: 'auto', p: 2 }}>
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" style={{ width: '100%', height: 'auto' }} />
        ) : (
          <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
        )}
        <br />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {!capturedImage && (
            <Button variant="contained" color="primary" onClick={handleCapture}>Capture</Button>
          )}
          <Button variant="outlined" color="secondary" onClick={handleClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CameraPanel;