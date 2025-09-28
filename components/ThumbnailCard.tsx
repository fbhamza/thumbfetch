import React, { useState, useCallback } from 'react';
import { Thumbnail } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { OpenIcon } from './icons/OpenIcon';

interface ThumbnailCardProps {
  thumbnail: Thumbnail;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ thumbnail }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);


  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(thumbnail.url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [thumbnail.url]);

  const handleImageError = () => {
    setHasError(true);
    setImageLoaded(true);
  }
  
  const handleDownload = useCallback(async () => {
    if (hasError || isDownloading) return;

    setIsDownloading(true);
    try {
      // Fetch the image and create a blob
      const response = await fetch(thumbnail.url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const objectUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = thumbnail.filename;
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link);
      
      // Clean up the temporary URL
      URL.revokeObjectURL(objectUrl);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. The thumbnail might not be available or there was a network issue.');
    } finally {
      setIsDownloading(false);
    }
  }, [thumbnail.url, thumbnail.filename, hasError, isDownloading]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <a href={hasError ? '#' : thumbnail.url} target="_blank" rel="noopener noreferrer" className={`relative group block ${hasError ? 'cursor-not-allowed' : ''}`}>
        <div className={`aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse ${imageLoaded ? 'hidden' : 'block'}`}></div>
        {!hasError ? (
          <img
            src={thumbnail.url}
            alt={`${thumbnail.label} thumbnail`}
            className={`w-full h-auto object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        ) : (
          <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center text-center p-4">
             <p className="text-sm text-gray-500 dark:text-gray-400">Not Available</p>
          </div>
        )}
        {!hasError && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <OpenIcon className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </div>
        )}
      </a>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{thumbnail.label}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{thumbnail.resolution}</p>
        <div className="mt-auto space-y-2">
            <button
                onClick={handleDownload}
                disabled={hasError || isDownloading}
                className={`w-full flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors duration-200 ${
                    hasError 
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                      : isDownloading 
                      ? 'bg-green-700 cursor-wait' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
            >
                <DownloadIcon className="h-4 w-4" />
                <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>
            <button
                onClick={handleCopyLink}
                disabled={hasError}
                className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <CopyIcon className="h-4 w-4" />
                <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailCard;