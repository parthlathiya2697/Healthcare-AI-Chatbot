import React from 'react';

interface VideoModalProps {
  videoSrc: string;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoSrc, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleBackgroundClick}
    >
      <div className="relative bg-white p-4 rounded-lg shadow-lg">
        <video src={videoSrc} controls autoPlay className="w-full h-auto" />
        <button
          onClick={onClose}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-red-500 text-lg"
        >
          <h1 style={{fontSize: '50px', position: 'fixed'}}>✖</h1>
        </button>
      </div>
    </div>
  );
};

export default VideoModal;