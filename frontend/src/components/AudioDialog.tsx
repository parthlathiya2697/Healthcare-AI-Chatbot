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

interface AudioDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAudioRecorded: (audioBlob: Blob) => void;
    onTextRecognized: (text: string) => void;
}
interface AudioDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAudioRecorded: (audioBlob: Blob) => void;
    onTextRecognized: (text: string) => void;
}

const AudioDialog: React.FC<AudioDialogProps> = ({
    isOpen,
    onClose,
    onAudioRecorded,
    onTextRecognized,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recognizedText, setRecognizedText] = useState<string>('');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    let chunks: BlobPart[] = [];
    const chunksRef = useRef<BlobPart[]>([]); // Use useRef for chunks
    const [mimeType, setMimeType] = useState<string>('');


    useEffect(() => {
        let userStream: MediaStream | null = null;

        if (isOpen) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    userStream = stream;
                    setStream(userStream);
                })
                .catch((err) => {
                    console.error('Error accessing microphone:', err);
                });
        }

        return () => {
            if (userStream) {
                userStream.getTracks().forEach((track) => track.stop());
                userStream = null;
                setStream(null);
            }
        };
    }, [isOpen]);

    const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    const handleStartRecording = () => {

        setAudioBlob(null);
        if (stream && recognition) {
            // Check and use a supported MIME type
            const supportedMimeTypes = [
                'audio/webm;codecs=opus',
                'audio/ogg;codecs=opus',
                'audio/webm',
                'audio/ogg',
            ];

            let selectedMimeType = '';
            for (let mimeType of supportedMimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType;
                    break;
                }
            }

            if (!selectedMimeType) {
                console.error('No supported MIME types for MediaRecorder');
                return;
            }

            setMimeType(selectedMimeType);

            const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
            setMediaRecorder(recorder);
            chunksRef.current = [];
            recorder.start();
            setIsRecording(true);
            setRecognizedText('');

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
            };

            recognition.lang = 'en-US';
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = event.results[event.resultIndex][0].transcript;
                console.log('Recognized Text:', transcript);
                setRecognizedText(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error: ', event.error);
            };

            recognition.onend = () => {
                console.log('Speech recognition ended.');
                setIsRecording(false);

                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    console.log('Audio Blob:', blob);
                    setAudioBlob(blob);
                }
            };

            recognition.start();
        }
    };

    useEffect(() => {
        if (audioRef.current && audioBlob) {
            const audioURL = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioURL;
            audioRef.current.load(); // Reload audio when audioBlob changes
        }
    }, [audioBlob]);


    const handleStopRecording = () => {
        if (mediaRecorder && recognition) {
            mediaRecorder.stop();
            recognition.stop();
            setIsRecording(false);
        }
    };

    const handleClose = () => {
        setAudioBlob(null);
        setRecognizedText('');
        onClose();
    };

    const handleUseText = () => {
        if (recognizedText) {
            onTextRecognized(recognizedText);
            handleClose();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('File selected:', event.target.files);
        if (event.target.files && event.target.files[0]) {
            setAudioFile(event.target.files[0]);
            setAudioBlob(event.target.files[0]);
            console.log('event.target.files[0]', event.target.files[0]);
        }
    };

    useEffect(() => {
        if (audioFile) {
            handleUploadAudio();
        }
    }, [audioFile]);

    const handleUploadAudio = async () => {
        if (audioFile) {
            const formData = new FormData();
            formData.append('audio_file', audioFile);

            fetch('http://localhost:8000/api/translate_audio/', {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.text) {
                        setRecognizedText(data.text);
                    } else {
                        console.error('Error:', data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error uploading audio file:', error);
                });
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={modalStyle}>
                {audioBlob ? (
                    <>
                        <p>Audio Preview</p>
                        <audio ref={audioRef} controls src={audioBlob ? URL.createObjectURL(audioBlob) : undefined} />
                    </>
                ) : (
                    <p>Record or Upload Audio Files</p>
                )}
                <br />
                <br />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        mt: 2,
                        flexWrap: 'nowrap',
                        justifyContent: 'space-around',
                    }}
                >
                    {isRecording ? (
                        <Button variant="contained" color="secondary" onClick={handleStopRecording}>
                            Stop
                        </Button>
                    ) : (
                        <Button variant="contained" color="primary" onClick={handleStartRecording}>
                            Record
                        </Button>
                    )}
                    <Button variant="contained" color="primary" component="label">
                        Choose File
                        <input type="file" accept="audio/*" hidden onChange={handleFileChange} />
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Box>

                <br />
                {recognizedText && (
                    <Box
                        sx={{
                            mt: 2,
                            textAlign: 'center',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            flexWrap: 'nowrap',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                        }}
                    >
                        <p>
                            <b>Recognized Text:</b>
                        </p>
                        <input
                            value={recognizedText}
                            onChange={(e) => setRecognizedText(e.target.value)}
                            style={{
                                border: '1px solid grey',
                                borderRadius: '10px',
                                padding: '10px',
                                width: '70%',
                            }}
                        />
                        <br />
                        <Button variant="contained" color="primary" onClick={handleUseText}>
                            Use Text
                        </Button>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default AudioDialog;
