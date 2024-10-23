import React from 'react';
import { Modal, Box } from '@mui/material';

interface ImageModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
}

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  height: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ImageModal: React.FC<ImageModalProps> = ({ imageSrc, isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: 'auto', height: 'auto', p: 2 }}>
        <img src={imageSrc} alt="Captured" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        <button
          onClick={onClose}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-red-500 text-lg"
        >
          <h1 style={{fontSize: '50px', position: 'fixed'}}>✖</h1>
        </button>
      </Box>
      
    </Modal>
  );
};

export default ImageModal;