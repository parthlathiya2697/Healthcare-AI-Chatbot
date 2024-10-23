import React, { useRef, useState } from 'react';
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
}

const VideoDialog: React.FC<VideoDialogProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleStartRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
          recorder.start();
          setIsRecording(true);
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
        });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={() => {
      if (!isRecording) {
        onClose();
      }
    }}>
      <Box sx={modalStyle}>
        <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
          {isRecording ? (
            <Button variant="contained" color="secondary" onClick={handleStopRecording}>Stop Recording</Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleStartRecording}>Start Recording</Button>
          )}
          <Button variant="outlined" color="secondary" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default VideoDialog;