import React, { useState, useCallback } from 'react';
import { VideoPrompt } from '../types.ts';
import { transformPromptToJson } from '../services/llm/router.ts';
import FilmIcon from './icons/FilmIcon.tsx';
import ClipboardIcon from './icons/ClipboardIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import JsonIcon from './icons/JsonIcon.tsx';
import Loader from './Loader.tsx';

interface PromptCardProps {
  prompt: VideoPrompt;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [jsonResult, setJsonResult] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleCopy = (textToCopy: string, type: 'prompt' | 'json') => {
    navigator.clipboard.writeText(textToCopy);
    if (type === 'prompt') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    }
  };

  const handleTransformToJson = useCallback(async () => {
    if (isTransforming) return;

    setIsTransforming(true);
    setJsonError(null);
    setJsonResult(null);

    try {
      const result = await transformPromptToJson(prompt.prompt);
      setJsonResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'An unknown error occurred during JSON transformation.');
    } finally {
      setIsTransforming(false);
    }
  }, [prompt.prompt, isTransforming]);

  return (
    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-red-500/10 flex flex-col">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <FilmIcon className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-zinc-100">{prompt.title}</h3>
          <p className="mt-2 text-zinc-400">{prompt.prompt}</p>
        </div>
      </div>
      
      {jsonResult && (
        <div className="mt-4 pt-4 border-t border-zinc-700/50 space-y-2">
            <pre className="text-xs bg-zinc-900 p-3 rounded-md overflow-x-auto text-zinc-300 max-h-60">
                <code>{jsonResult}</code>
            </pre>
            <div className="flex justify-end">
                <button
                    onClick={() => handleCopy(jsonResult, 'json')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors"
                >
                    {jsonCopied ? (
                        <>
                            <CheckIcon className="w-4 h-4 text-green-400" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-4 h-4" />
                            <span>Copy JSON</span>
                        </>
                    )}
                </button>
            </div>
        </div>
      )}
      
      {jsonError && (
          <div className="mt-4 text-center bg-red-900/50 border border-red-500 text-red-300 p-2 rounded-lg text-xs">
              <p>{jsonError}</p>
          </div>
      )}

      <div className="mt-4 pt-4 border-t border-zinc-700/50 flex justify-end gap-2">
        <button
            onClick={handleTransformToJson}
            disabled={isTransforming}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500"
            aria-label="Transform to JSON"
        >
            {isTransforming ? (
                <>
                    <Loader className="h-4 w-4" />
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    <JsonIcon className="w-4 h-4" />
                    <span>To JSON</span>
                </>
            )}
        </button>
        <button
          onClick={() => handleCopy(prompt.prompt, 'prompt')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500"
          aria-label="Copy prompt"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptCard;