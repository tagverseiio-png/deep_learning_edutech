// Media URL utilities for handling file paths and constructing full URLs

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.deeplearningedutech.com/api';

/**
 * Convert a relative file path to a full media URL
 * Examples:
 *   'images/file.jpg' -> 'https://api.deeplearningedutech.com/api/../uploads/images/file.jpg'
 *   'videos/video.mp4' -> 'https://api.deeplearningedutech.com/api/../uploads/videos/video.mp4'
 */
export const getMediaUrl = (relativePath: string | undefined | null): string | null => {
  if (!relativePath) return null;
  
  // If it's already a full URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Extract the base URL without /api suffix
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${baseUrl}/uploads/${relativePath}`;
};

/**
 * Extract relative path from a full media URL (reverse operation)
 */
export const extractRelativePath = (fullUrl: string | undefined | null): string | null => {
  if (!fullUrl) return null;
  
  // If already relative, return as-is
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    return fullUrl;
  }
  
  // Extract everything after /uploads/
  const match = fullUrl.match(/\/uploads\/(.+)$/);
  return match ? match[1] : fullUrl;
};
