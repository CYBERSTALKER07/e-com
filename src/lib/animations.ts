import { Variants } from "framer-motion";

// Mobile detection utility
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
};

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Helper function to disable animations on mobile
const getVariants = (variants: Variants): Variants => {
  if (isMobileDevice() || prefersReducedMotion()) {
    // Return static variants with no animation
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 1, transition: { duration: 0 } }
    };
  }
  return variants;
};

// Fade in animation
export const fadeIn: Variants = getVariants({
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
});

// Slide up animation
export const slideUp: Variants = getVariants({
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
});

// Slide in from left
export const slideInLeft: Variants = getVariants({
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    x: -50, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
});

// Slide in from right
export const slideInRight: Variants = getVariants({
  hidden: { x: 50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    x: 50, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
});

// Scale animation
export const scaleUp: Variants = getVariants({
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    scale: 0.9, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
});

// Staggered list items animation
export const staggeredContainer: Variants = getVariants({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
});

export const staggeredItem: Variants = getVariants({
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
});

// Page transition animation
export const pageTransition: Variants = getVariants({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      duration: 0.2
    }
  }
});

// Button hover and tap animations - disable on mobile
export const buttonHover = isMobileDevice() ? {} : {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const buttonTap = isMobileDevice() ? {} : {
  scale: 0.95,
  transition: { duration: 0.1 }
};

// Export mobile detection for use in components
export { isMobileDevice, prefersReducedMotion };