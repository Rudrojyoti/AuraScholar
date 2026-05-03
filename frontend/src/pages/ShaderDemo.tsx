import React from 'react';
import AnoAI from '@/components/ui/animated-shader-background';

const ShaderDemo = () => {
  return (
    <div className="w-full h-screen bg-black relative">
      <AnoAI />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            Animated Shader Background
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Advanced WebGL shader animations with Three.js
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderDemo;
