import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-8xl font-black tracking-tighter text-zinc-100">
            Z-TURBO
          </h1>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-300">
            <span className="font-bold text-red-500">BRKN</span> AI Prompt Generator
          </h2>
        </div>
      </div>
    </header>
  );
};

export default Header;