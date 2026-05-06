import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CursorContext = createContext(null);

export const CursorProvider = ({ children, global = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    if (!global) return;

    const moveHandler = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    
    const enterHandler = () => setIsVisible(true);
    const leaveHandler = () => setIsVisible(false);

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseenter', enterHandler);
    window.addEventListener('mouseleave', leaveHandler);
    
    // Default to visible when mounted
    setIsVisible(true);
    
    // Hide default cursor globally
    document.body.style.cursor = 'none';
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach(el => {
      el.style.cursor = 'none';
    });

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseenter', enterHandler);
      window.removeEventListener('mouseleave', leaveHandler);
      document.body.style.cursor = 'auto';
    };
  }, [global, x, y]);

  return (
    <CursorContext.Provider value={{ x, y, isVisible, setIsVisible, global }}>
      {children}
    </CursorContext.Provider>
  );
};

export const CursorContainer = ({ asChild = false, className, children, ...props }) => {
  const { x, y, setIsVisible, global } = useContext(CursorContext);
  const Comp = asChild ? Slot : motion.div;

  if (global) {
    return <Comp className={className} {...props}>{children}</Comp>;
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <Comp
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className={cn('relative overflow-hidden cursor-none', className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const Cursor = ({ asChild = false, className, ...props }) => {
  const { x, y, isVisible } = useContext(CursorContext);

  if (!isVisible) return null;

  const Comp = asChild ? motion.div : motion.div; // Slot doesn't support framer-motion props easily without forwardRef wrapping
  
  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        pointerEvents: 'none',
        zIndex: 9999,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      {asChild ? (
        props.children
      ) : (
        <div className={cn("w-4 h-4 bg-white rounded-full mix-blend-difference", className)} {...props} />
      )}
    </motion.div>
  );
};

export const CursorFollow = ({
  asChild = false,
  side = 'bottom',
  sideOffset = 0,
  align = 'end',
  alignOffset = 0,
  transition = { stiffness: 500, damping: 50, bounce: 0 },
  className,
  ...props
}) => {
  const { x, y, isVisible } = useContext(CursorContext);
  
  // Create smooth spring values that follow the main x, y
  const springX = useSpring(x, transition);
  const springY = useSpring(y, transition);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: springX,
        y: springY,
        pointerEvents: 'none',
        zIndex: 9998,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      {asChild ? (
        props.children
      ) : (
        <div 
          className={cn(
            "w-10 h-10 border border-white/50 rounded-full mix-blend-difference",
            className
          )} 
          {...props} 
        />
      )}
    </motion.div>
  );
};
