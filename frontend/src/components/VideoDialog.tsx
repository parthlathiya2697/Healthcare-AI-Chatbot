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
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    let chunks: BlobPart[] = [];

    useEffect(() => {
        let stream: MediaStream | null = null; // Declare stream variable
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(newStream => {
                    stream = newStream; // Assign the stream
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
                            // Stop the camera stream after recording
                            stream.getTracks().forEach(track => track.stop()); // Stop the stream
                        } else {
                            console.error("No video data recorded.");
                        }
                    };
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                });
        } else {
            // Close the camera stream when the dialog is closed
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null; // Reset the stream
            }
        }
        // Cleanup the stream when the component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
        };
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
            setIsRecording(false);
        }
    };

    const handleClose = () => {
        setVideoBlob(null);
        setSelectedVideo(null);
        onClose();
    };

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedVideo(file);
            // Directly use the File object as the video source
            setVideoBlob(file); 
            onVideoRecorded(file); 
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
        <Box sx={{ ...modalStyle, width: '400px', height: 'auto', p: 2 }}>
            <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
            <br />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                {!videoBlob && isRecording ? (
                    <Button variant="contained" color="secondary" onClick={handleStopRecording} sx={{ fontSize: '0.8rem' }}>Stop</Button>
                ) : (
                    <>
                        <Button variant="contained" color="primary" onClick={handleStartRecording} sx={{ fontSize: '0.8rem' }}>Start</Button>
                        <Button variant="contained" color="primary" component="label" sx={{ ml: 1, fontSize: '0.8rem' }}>
                            Choose File
                            <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
                        </Button>
                    </>
                )}
                <Button variant="outlined" color="secondary" onClick={handleClose} sx={{ ml: 1, fontSize: '0.8rem' }}>Close</Button>
            </Box>
        </Box>
    </Modal>
    );
};

export default VideoDialog;