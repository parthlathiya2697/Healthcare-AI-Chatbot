import React from 'react';
import { Modal, Box, Button } from '@mui/material';

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

const ImageModal: React.FC<ImageModalProps> = ({ imageSrc, isOpen, onClose }) => {
    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box sx={{ ...modalStyle, width: '400px', height: 'auto', p: 2 }}>
                <img src={imageSrc} alt="Captured" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                <br/>
                <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
                </Box>
        </Modal>
    );
};

export default ImageModal;