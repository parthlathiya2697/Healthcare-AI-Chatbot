import React from 'react';
import { Modal, Box, Button } from '@mui/material';

interface MediaModalProps {
  mediaSrc: string | null;
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'image' | 'video';
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

const MediaModal: React.FC<MediaModalProps> = ({ mediaSrc, isOpen, onClose, mediaType }) => {
  if (!isOpen || !mediaSrc) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={modalStyle}>
        {mediaType === 'image' ? (
          <img src={mediaSrc} alt="Media" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        ) : (
          <video src={mediaSrc} controls style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        )}
        <br />
        <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
      </Box>
    </Modal>
  );
};

export default MediaModal;