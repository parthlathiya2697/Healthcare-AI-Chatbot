import React, { useRef, useState, useEffect } from 'react';
import { Modal, Box, Button } from '@mui/material';

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

interface VideoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onVideoRecorded: (videoBlob: Blob) => void;
}

const VideoDialog: React.FC<VideoDialogProps> = ({ isOpen, onClose, onVideoRecorded }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    let chunks: BlobPart[] = [];

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);
                    chunks = [];
                    recorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };
                    recorder.onstop = () => {
                        if (chunks.length > 0) {
                            const blob = new Blob(chunks, { type: 'video/webm' });
                            setVideoBlob(blob);
                            onVideoRecorded(blob);
                            chunks = [];
                        } else {
                            console.error("No video data recorded.");
                        }
                    };
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                });
        }
    }, [isOpen]);

    const handleStartRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.start();
            setIsRecording(true);
            setVideoBlob(null); // Clear previous video blob
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleClose = () => {
        setVideoBlob(null);
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={{ ...modalStyle, width: '400px', height: 'auto', p: 2 }}>
                <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
                <br/>
                {!videoBlob && isRecording ? (
                    <Button variant="contained" color="secondary" onClick={handleStopRecording}>Stop Recording</Button>
                ) : (
                    <Button variant="contained" color="primary" onClick={handleStartRecording}>Start Recording</Button>
                )}
                <Button variant="outlined" color="secondary" onClick={handleClose}>Close</Button>
            </Box>
        </Modal>
    );
};

export default VideoDialog;