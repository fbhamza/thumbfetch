import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Thumbnail } from './types';
import { THUMBNAIL_QUALITIES, getThumbnailUrl } from './constants';
import ThumbnailCard from './components/ThumbnailCard';
import { YouTubeIcon } from './components/icons/YouTubeIcon';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') {
        return true;
    }
    if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'light') {
        return false;
    }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const extractVideoId = useCallback((input: string): string | null => {
    if (!input) return null;
    
    const regexPatterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (const regex of regexPatterns) {
      const match = input.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }, []);

  const handleGetThumbnails = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setVideoId(null);
    
    const extractedId = extractVideoId(youtubeInput.trim());

    setTimeout(() => {
        if (extractedId) {
            setVideoId(extractedId);
        } else {
            setError('Please enter a valid YouTube URL or video ID.');
        }
        setIsLoading(false);
    }, 500); // Simulate a small delay for UX

  }, [youtubeInput, extractVideoId]);

  const thumbnails = useMemo((): Thumbnail[] => {
    if (!videoId) return [];
    return THUMBNAIL_QUALITIES.map(({ quality, label, resolution }) => ({
      quality,
      label,
      resolution,
      url: getThumbnailUrl(videoId, quality),
      filename: `${videoId}_${quality}.jpg`
    }));
  }, [videoId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300 relative">
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-16">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>

        <header className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <YouTubeIcon className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">ThumbFetch</h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto">
            Paste a YouTube link or video ID to get all available thumbnails.
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg transition-colors duration-300">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetThumbnails()}
              placeholder="e.g., dQw4w9WgXcQ"
              className="flex-grow w-full px-4 py-3 text-base sm:text-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button
              onClick={handleGetThumbnails}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3 text-base sm:text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Get Thumbnails'
              )}
            </button>
          </div>
          {error && <p className="text-red-600 dark:text-red-400 mt-3 text-center sm:text-left">{error}</p>}
        </div>

        {thumbnails.length > 0 && (
          <section className="mt-10 md:mt-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Available Thumbnails</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {thumbnails.map(thumb => (
                <ThumbnailCard key={thumb.quality} thumbnail={thumb} />
              ))}
            </div>
          </section>
        )}
        
        <footer className="text-center mt-12 md:mt-16">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                This tool only retrieves publicly available YouTube thumbnails. Please respect copyright when using images.
            </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
