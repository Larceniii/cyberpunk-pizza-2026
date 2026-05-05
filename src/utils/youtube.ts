import { Channel, Video } from '../types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const parseChannelUrl = (input: string): string | null => {
  // Remove whitespace
  const cleanInput = input.trim();
  
  // Handle @username format
  if (cleanInput.startsWith('@')) {
    return cleanInput;
  }
  
  // Handle various YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match) {
      return match[0].includes('/@') ? `@${match[1]}` : match[1];
    }
  }
  
  // If no pattern matches, assume it's a channel handle or ID
  return cleanInput;
};

export const searchChannel = async (query: string, apiKey: string): Promise<Channel | null> => {
  try {
    let searchQuery = query;
    
    // If it starts with @, remove it for the API call
    if (query.startsWith('@')) {
      searchQuery = query.substring(1);
    }
    
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search channel');
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        id: item.id.channelId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        handle: query.startsWith('@') ? query : undefined,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error searching channel:', error);
    return null;
  }
};

export const getChannelById = async (channelId: string, apiKey: string): Promise<Channel | null> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch channel');
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        subscriberCount: item.statistics.subscriberCount,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching channel:', error);
    return null;
  }
};

export const getChannelVideos = async (channelId: string, apiKey: string, maxResults: number = 50): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    const data = await response.json();
    
    if (data.items) {
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const getAllVideos = async (channels: Channel[], apiKey: string): Promise<Video[]> => {
  const allVideos: Video[] = [];
  
  for (const channel of channels) {
    const videos = await getChannelVideos(channel.id, apiKey);
    allVideos.push(...videos);
  }
  
  // Sort by publish date (newest first)
  return allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};