export interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  handle?: string;
  subscriberCount?: string;
  labels: string[];
}

export interface Video {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
  duration?: string;
}

export interface AppData {
  channels: Channel[];
  apiKey: string;
  watchedVideos: Set<string>;
  pollingEnabled: boolean;
  pollingInterval: number; // in minutes
  apiCallCount: number;
  cachedVideos: Record<string, Video>;
  labels: string[];
  appTitle?: string;
  accentColor?: string;
}