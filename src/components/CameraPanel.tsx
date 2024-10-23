import React, { useRef, useEffect } from 'react';
import { Modal, Box, Button } from '@mui/material';

interface CameraPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

const modalStyle = {
  position: 'fixed',  // Use fixed positioning
  top: '50%',         // Position the top edge of the element at the middle of the screen
  left: '50%',        // Position the left edge of the element at the middle of the screen
  transform: 'translate(-50%, -50%)', // Shift the element to the left and up by half its width and height
  width: '400px',     // Set a fixed width
  height: 'auto',     // Auto-adjust the height based on content
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center-align the items vertically
  justifyContent: 'center' // Center-align the items horizontally
};

const CameraPanel: React.FC<CameraPanelProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(error => console.error("Error accessing camera:", error));
    }
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        onCapture(imageData);
      }
    }
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
    <Box sx={{ ...modalStyle, width: '400px', height: 'auto', p: 2 }}>
      <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCapture}>Capture</Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
      </Box>
    </Box>
  </Modal>
  );
};

export default CameraPanel;