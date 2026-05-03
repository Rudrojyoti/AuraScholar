import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const InteractiveButtonShowcase = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Interactive Button Showcase</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Primary Buttons */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-400">Primary Actions</h2>
            <InteractiveHoverButton text="Get Started" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white" />
            <InteractiveHoverButton text="Sign Up" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white" />
            <InteractiveHoverButton text="Learn More" className="bg-gradient-to-r from-green-500 to-teal-500 text-white" />
          </div>

          {/* Secondary Buttons */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-400">Secondary Actions</h2>
            <InteractiveHoverButton text="Login" className="border border-gray-600 text-gray-300 hover:bg-gray-800" />
            <InteractiveHoverButton text="Settings" className="border border-gray-600 text-gray-300 hover:bg-gray-800" />
            <InteractiveHoverButton text="Profile" className="border border-gray-600 text-gray-300 hover:bg-gray-800" />
          </div>

          {/* Dark Theme Buttons */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-400">Dark Theme</h2>
            <InteractiveHoverButton text="Download" className="bg-gray-900 text-white border-gray-700" />
            <InteractiveHoverButton text="Upload" className="bg-gray-900 text-white border-gray-700" />
            <InteractiveHoverButton text="Share" className="bg-gray-900 text-white border-gray-700" />
          </div>
        </div>

        {/* Feature Demo Section */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold text-center">Interactive Features</h2>
          <div className="bg-gray-900 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Hover Effects</h3>
                <p className="text-gray-400 mb-4">Each button features smooth hover animations with sliding text and arrow indicators.</p>
                <InteractiveHoverButton text="Hover Me" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Dark Theme Compatible</h3>
                <p className="text-gray-400 mb-4">All buttons are optimized for dark backgrounds with proper contrast.</p>
                <InteractiveHoverButton text="Dark Mode" className="bg-black text-white border-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveButtonShowcase;
