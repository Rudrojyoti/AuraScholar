import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Click = ({
  children,
  color = 'rgba(59, 130, 246, 0.5)', // Default to a nice blue
  size = 100,
  duration = 500,
  scope,
  disabled = false,
  variant = 'ring',
  className = ''
}) => {
  const [effects, setEffects] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (scope && scope.current) {
      const el = scope.current;
      const handler = (e) => handleTrigger(e);
      el.addEventListener('click', handler);
      return () => el.removeEventListener('click', handler);
    }
  }, [scope, disabled]);

  const handleTrigger = (e) => {
    if (disabled) return;

    // Use document coordinates if using scope, otherwise local coordinates
    let x, y;
    if (scope && scope.current) {
      x = e.clientX;
      y = e.clientY;
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const id = Date.now() + Math.random();
    setEffects((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setEffects((prev) => prev.filter((effect) => effect.id !== id));
    }, duration);
  };

  const renderEffect = (effect) => {
    const commonProps = {
      initial: { opacity: 1, scale: 0 },
      animate: { opacity: 0, scale: 1 },
      exit: { opacity: 0 },
      transition: { duration: duration / 1000, ease: "easeOut" },
      style: {
        position: 'absolute',
        left: effect.x,
        top: effect.y,
        x: '-50%',
        y: '-50%',
        pointerEvents: 'none',
        zIndex: 9999,
      }
    };

    switch (variant) {
      case 'ripple':
        return (
          <motion.div
            key={effect.id}
            {...commonProps}
            style={{
              ...commonProps.style,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: '50%',
            }}
          />
        );
      case 'ring':
        return (
          <motion.div
            key={effect.id}
            {...commonProps}
            style={{
              ...commonProps.style,
              width: size,
              height: size,
              border: `2px solid ${color}`,
              borderRadius: '50%',
              backgroundColor: 'transparent',
            }}
          />
        );
      case 'crosshair':
        return (
          <motion.div
            key={effect.id}
            {...commonProps}
            initial={{ opacity: 1, scale: 0, rotate: -45 }}
            animate={{ opacity: 0, scale: 1, rotate: 45 }}
          >
            <div style={{ position: 'absolute', width: size, height: 2, backgroundColor: color, left: -size/2, top: 0 }} />
            <div style={{ position: 'absolute', width: 2, height: size, backgroundColor: color, left: 0, top: -size/2 }} />
          </motion.div>
        );
      case 'burst':
      case 'particles':
        const particleCount = variant === 'burst' ? 8 : 12;
        const particles = Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i * 360) / particleCount;
          const radian = (angle * Math.PI) / 180;
          const distance = size / 2;
          return {
            x: Math.cos(radian) * distance,
            y: Math.sin(radian) * distance,
          };
        });

        return (
          <div
            key={effect.id}
            style={{
              position: 'absolute',
              left: effect.x,
              top: effect.y,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            {particles.map((p, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                transition={{ duration: duration / 1000, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  width: variant === 'burst' ? 12 : 6,
                  height: variant === 'burst' ? 2 : 6,
                  backgroundColor: color,
                  borderRadius: variant === 'burst' ? '1px' : '50%',
                  rotate: variant === 'burst' ? `${(i * 360) / particleCount}deg` : 0,
                  x: '-50%',
                  y: '-50%',
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (scope) {
    return (
      <>
        {children}
        {scope.current && (
          <AnimatePresence>
            {effects.map(renderEffect)}
          </AnimatePresence>
        )}
      </>
    );
  }

  return (
    <div 
      ref={containerRef} 
      onClick={handleTrigger} 
      className={`relative ${className}`}
      style={{ minHeight: '100vh', width: '100%' }}
    >
      {children}
      <AnimatePresence>
        {effects.map(renderEffect)}
      </AnimatePresence>
    </div>
  );
};
