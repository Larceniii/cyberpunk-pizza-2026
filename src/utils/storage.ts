import { AppData } from '../types';

const STORAGE_KEY = 'youtube-aggregator-data';

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert watchedVideos array back to Set
      return {
        ...data,
        watchedVideos: new Set(Array.isArray(data.watchedVideos) ? data.watchedVideos : []),
        pollingEnabled: data.pollingEnabled || false,
        pollingInterval: data.pollingInterval || 60,
        apiCallCount: data.apiCallCount || 0,
        cachedVideos: data.cachedVideos || {},
        labels: data.labels || [],
        appTitle: data.appTitle || 'MyTube',
        accentColor: data.accentColor || '#e03131',
        channels: (data.channels || []).map((channel: any) => ({
          ...channel,
          labels: channel.labels || []
        })),
      };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  return {
    channels: [],
    apiKey: '',
    watchedVideos: new Set(),
    pollingEnabled: false,
    pollingInterval: 60,
    apiCallCount: 0,
    cachedVideos: {},
    labels: [],
    appTitle: 'MyTube',
    accentColor: '#e03131',
  };
};

export const saveData = (data: AppData): void => {
  try {
    // Convert Set to array for JSON serialization
    const dataToSave = {
      ...data,
      watchedVideos: Array.from(data.watchedVideos),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

const POLL_TIMESTAMP_KEY = 'mytube_last_poll_timestamp';

export const setLastPollTimestamp = (timestamp: number): void => {
  try {
    localStorage.setItem(POLL_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving poll timestamp:', error);
  }
};

export const getLastPollTimestamp = (): number => {
  try {
    const stored = localStorage.getItem(POLL_TIMESTAMP_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.error('Error loading poll timestamp:', error);
    return 0;
  }
};
export const exportData = (data: AppData): void => {
  const dataToExport = {
    ...data,
    watchedVideos: Array.from(data.watchedVideos),
  };
  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'youtube-channels.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};