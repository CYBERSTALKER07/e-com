import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../../lib/animations';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        ...fadeIn,
        visible: {
          ...fadeIn.visible,
          transition: { 
            ...fadeIn.visible.transition,
            delay 
          }
        }
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;