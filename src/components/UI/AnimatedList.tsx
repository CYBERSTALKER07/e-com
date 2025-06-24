import React from 'react';
import { motion } from 'framer-motion';
import { staggeredContainer, staggeredItem } from '../../lib/animations';

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
}

const AnimatedList: React.FC<AnimatedListProps> = ({ children, className = '' }) => {
  return (
    <motion.ul
      className={className}
      variants={staggeredContainer}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.li key={index} variants={staggeredItem}>
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
};

export default AnimatedList;