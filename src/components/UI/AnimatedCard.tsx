import React from 'react';
import { motion } from 'framer-motion';
import { scaleUp } from '../../lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      variants={scaleUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;