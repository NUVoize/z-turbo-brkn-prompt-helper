import React from 'react';
import { Idea } from '../types.ts';
import LightbulbIcon from './icons/LightbulbIcon.tsx';

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-red-500/10">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <LightbulbIcon className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-zinc-100">{idea.title}</h3>
          <p className="mt-2 text-zinc-400">{idea.description}</p>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;