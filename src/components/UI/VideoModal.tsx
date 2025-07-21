import React, { useEffect, useRef } from 'react';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import { gsap } from 'gsap';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title = "Brand Story Video" 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Animate modal entrance
      if (overlayRef.current && contentRef.current) {
        gsap.set(overlayRef.current, { opacity: 0 });
        gsap.set(contentRef.current, { scale: 0.8, opacity: 0, y: 50 });
        
        const tl = gsap.timeline();
        tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
          .to(contentRef.current, { 
            scale: 1, 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            ease: 'back.out(1.7)' 
          }, 0.1);
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && contentRef.current) {
      const tl = gsap.timeline();
      tl.to(contentRef.current, { 
        scale: 0.8, 
        opacity: 0, 
        y: 50, 
        duration: 0.3, 
        ease: 'power2.in' 
      })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0.1)
      .call(() => onClose());
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Content */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-4xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse" />
            <h3 className="text-white font-semibold text-lg">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              ) : (
                <Volume2 className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            <button
              onClick={handleClose}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 transition-all duration-300 group"
            >
              <X className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-gray-900">
          {videoUrl.includes('vimeo') || videoUrl.includes('youtube') ? (
            <iframe
              src={`${videoUrl}?autoplay=1&muted=${isMuted ? 1 : 0}`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={title}
            />
          ) : (
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted={isMuted}
              src={videoUrl}
            />
          )}
          
          {/* Custom Play Button Overlay (for non-iframe videos) */}
          {!videoUrl.includes('vimeo') && !videoUrl.includes('youtube') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-center">
            <p className="text-white/80 text-sm">
              Discover the craftsmanship and passion behind our premium collections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;