import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 3000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure component is mounted and refs are available
    if (!containerRef.current || !titleRef.current || !subtitleRef.current) return;
    
    setIsReady(true);

    const container = containerRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;

    // Create GSAP timeline with safety checks
    const tl = gsap.timeline();

    // Initial states with null checks
    if (title && subtitle) {
      gsap.set([title, subtitle], { 
        opacity: 0, 
        y: 50, 
        scale: 0.8 
      });
    }

    // Animation sequence with safety checks
    if (container) {
      tl.to(container, {
        duration: 0.5,
        background: 'white',
        ease: 'power2.out'
      });
    }

    if (title) {
      tl.to(title, {
        duration: 1,
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'elastic.out(1, 0.75)',
      });
    }

    if (subtitle) {
      tl.to(subtitle, {
        duration: 0.8,
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'power2.out',
      }, '-=0.3');
    }

    if (title && subtitle) {
      tl.to([title, subtitle], {
        duration: 0.5,
        scale: 1.1,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
      }, '+=0.5');
    }

    if (container && onFinish) {
      tl.to(container, {
        duration: 0.8,
        opacity: 0,
        scale: 1.1,
        ease: 'power2.in',
        onComplete: () => {
          try {
            onFinish();
          } catch (error) {
            console.error('Error in SplashScreen onFinish callback:', error);
          }
        }
      }, `+=${Math.max(0, duration / 1000 - 3)}`);
    }

    // Cleanup function
    return () => {
      try {
        tl.kill();
      } catch (error) {
        console.error('Error killing GSAP timeline:', error);
      }
    };
  }, [onFinish, duration, isReady]);

  // Fallback timeout in case GSAP fails
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      try {
        onFinish();
      } catch (error) {
        console.error('Error in fallback timeout:', error);
      }
    }, duration + 1000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [onFinish, duration]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="text-center">
        {/* Main Title */}
        <div ref={titleRef} className="mb-6">
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-wider">
            Buyursin
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef}>
          <p className="text-xl md:text-2xl text-white font-light tracking-wide">
            Discover Your Perfect Style
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;