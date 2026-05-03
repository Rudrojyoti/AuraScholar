import React from 'react';
import AnoAI from '@/components/ui/animated-shader-background';

const AnimatedDemo = () => {
  return (
    <div className="w-full h-screen bg-black relative">
      <AnoAI />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            Animated Shader Background
          </h1>
          <p className="text-xl text-gray-300">
            Advanced WebGL shader animations with Three.js
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDemo;
