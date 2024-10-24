import React, { useRef, useState, useEffect } from 'react';
import { Modal, Box, Button, TextField } from '@mui/material';

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

interface AudioDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAudioRecorded: (audioBlob: Blob) => void;
    onTextRecognized: (text: string) => void;
}

const AudioDialog: React.FC<AudioDialogProps> = ({ isOpen, onClose, onAudioRecorded, onTextRecognized }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recognizedText, setRecognizedText] = useState<string>('');
    const [stream, setStream] = useState<MediaStream | null>(null); // State to hold the audio stream

    let chunks: BlobPart[] = [];

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(userStream => {
                    setStream(userStream); // Store the stream
                })
                .catch(err => {
                    console.error("Error accessing microphone:", err);
                });
        }

        // Cleanup function to stop the stream when the dialog is closed
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); // Stop all tracks
            }
        };
    }, [isOpen]);

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    const handleStartRecording = () => {
        if (stream && recognition) {
            // Create a new MediaRecorder instance for each recording
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            chunks = [];
            recorder.start();
            setIsRecording(true);
            setRecognizedText(''); // Reset recognized text on new recording

            // Start speech recognition
            recognition.lang = 'en-US';
            recognition.interimResults = true; // Enable interim results
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = event.results[event.resultIndex][0].transcript;
                console.log("Recognized Text:", transcript);
                setRecognizedText(transcript); // Update recognized text in real-time
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error: ", event.error);
            };

            recognition.onend = () => {
                console.log("Speech recognition ended.");
                setIsRecording(false);
                // Do not close the dialog here
            };

            recognition.start();
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && recognition) {
            mediaRecorder.stop();
            recognition.stop(); // Stop recognition when recording stops
            setIsRecording(false); // Update recording state
        }
    };

    const handleClose = () => {
        setAudioBlob(null);
        setRecognizedText(''); // Reset recognized text on close
        onClose();
    };

    const handleUseText = () => {
        if (recognizedText) {
            onTextRecognized(recognizedText); // Pass recognized text to parent
            handleClose(); // Close the dialog
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={modalStyle}>
                <audio ref={audioRef} controls src={audioBlob ? URL.createObjectURL(audioBlob) : undefined} />
                <Box sx={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', mt: 2, flexWrap: 'nowrap', justifyContent: 'space-around'
                }}>
                    {isRecording ? (
                        <Button variant="contained" color="secondary" onClick={handleStopRecording}>Stop</Button>
                    ) : (
                        <Button variant="contained" color="primary" onClick={handleStartRecording}>Start</Button>
                    )}
                    
                    <Button variant="outlined" color="secondary" onClick={handleClose}>Close</Button>
                </Box>
                <br/>
                {recognizedText && (
                        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
                            <p>Recognized Text:</p>
                            <TextField
                                value={recognizedText}
                                multiline
                                rows={4}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <Button variant="contained" color="primary" onClick={handleUseText}>Use Text</Button>
                        </Box>
                    )}
            </Box>
            
        </Modal>
    );
};

export default AudioDialog;