import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 3000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;

    if (!container || !title || !subtitle) return;

    // Create GSAP timeline
    const tl = gsap.timeline();

    // Initial states
    gsap.set([title, subtitle], { 
      opacity: 0, 
      y: 50, 
      scale: 0.8 
    });

    // Animation sequence
    tl.to(container, {
      duration: 0.5,
      background: 'white',
      ease: 'power2.out'
    })
    .to(title, {
      duration: 1,
      opacity: 1,
      y: 0,
      scale: 1,
      ease: 'elastic.out(1, 0.75)',
    })
    .to(subtitle, {
      duration: 0.8,
      opacity: 1,
      y: 0,
      scale: 1,
      ease: 'power2.out',
    }, '-=0.3')
    .to([title, subtitle], {
      duration: 0.5,
      scale: 1.1,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
    }, '+=0.5')
    .to(container, {
      duration: 0.8,
      opacity: 0,
      scale: 1.1,
      ease: 'power2.in',
      onComplete: onFinish
    }, `+=${duration / 1000 - 3}`);

    return () => {
      tl.kill();
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
          <h1 className="text-6xl md:text-8xl font-bold text-black tracking-wider">
            Buyursin
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef}>
          <p className="text-xl md:text-2xl text-black font-light tracking-wide">
            Discover Your Perfect Style
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;