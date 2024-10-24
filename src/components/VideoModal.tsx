import React from 'react';
import { Modal, Box, Button } from '@mui/material';


interface VideoModalProps {
    videoSrc: string;
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const VideoModal: React.FC<VideoModalProps> = ({ videoSrc, isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={{ ...modalStyle, width: '400px', height: 'auto', p: 2 }}>
                <video src={videoSrc} controls autoPlay className="w-full h-auto" />
                <br/>
                <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
            </Box>
        </Modal>
    );
};

export default VideoModal;