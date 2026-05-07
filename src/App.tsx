import { useState, useEffect } from 'react';
import {
  AppShell,
  Burger,
  Group,
  Text,
  Button,
  ActionIcon,
  Tooltip,
  Badge,
  SegmentedControl,
  Box,
  Flex,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { RefreshCw, ArrowUpDown, Search, Filter } from 'lucide-react';
import { TextInput, ActionIcon as MantineActionIcon } from '@mantine/core';
import LandingPage from './components/LandingPage';
import ChannelsSidebar from './components/ChannelsSidebar';
import ChannelManager from './components/ChannelManager';
import LabelManager from './components/LabelManager';
import ChannelLabelEditor from './components/ChannelLabelEditor';
import VideoGrid from './components/VideoGrid';
import Settings from './components/Settings';
import Footer from './components/Footer';
import { Channel, Video, AppData } from './types';
import { loadData, saveData, exportData, importData, setLastPollTimestamp, getLastPollTimestamp } from './utils/storage';
import { getAllVideos } from './utils/youtube';

type VideoSortOption = 'newest' | 'oldest' | 'alphabetical' | 'channel' | 'unwatched';

function App() {
  const [data, setData] = useState<AppData>({
    channels: [],
    apiKey: '',
    watchedVideos: new Set(),
    pollingEnabled: false,
    pollingInterval: 60,
    apiCallCount: 0,
    cachedVideos: {},
    labels: [],
  });
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastVideoCount, setLastVideoCount] = useState(0);
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);
  const [showChannelManager, setShowChannelManager] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [showChannelLabelEditor, setShowChannelLabelEditor] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [highlightRefreshButton, setHighlightRefreshButton] = useState(false);
  const [videoSortBy, setVideoSortBy] = useState<VideoSortOption>('newest');
  const [mobileNavOpened, mobileNav] = useDisclosure(false);
  const [desktopNavOpened, desktopNav] = useDisclosure(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnwatchedOnly, setShowUnwatchedOnly] = useState(false);

  useEffect(() => {
    const savedData = loadData();
    setData(savedData);
    if (savedData.cachedVideos && Object.keys(savedData.cachedVideos).length > 0) {
      const cachedVideosList = Object.values(savedData.cachedVideos)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setVideos(cachedVideosList);
      setLastVideoCount(cachedVideosList.length);
    }
  }, []);

  useEffect(() => {
    if (!data.pollingEnabled || !data.apiKey || data.channels.length === 0) return;

    const interval = setInterval(async () => {
      const lastPollTimestamp = getLastPollTimestamp();
      const expectedNextPollTime = lastPollTimestamp + (data.pollingInterval * 60 * 1000);
      const now = Date.now();
      if (lastPollTimestamp > 0 && now < expectedNextPollTime - 5000) return;

      try {
        const allVideos = await getAllVideos(data.channels, data.apiKey);
        handleApiCall(data.channels.length);

        setData(prevData => {
          const newCachedVideos = { ...prevData.cachedVideos };
          allVideos.forEach(video => { newCachedVideos[video.id] = video; });
          const allCachedVideos = Object.values(newCachedVideos)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

          if (allCachedVideos.length > lastVideoCount && lastVideoCount > 0) {
            const newVideoCount = allCachedVideos.length - lastVideoCount;
            notifications.show({
              title: 'New Videos',
              message: `${newVideoCount} new video${newVideoCount > 1 ? 's' : ''} from your channels`,
              color: 'green',
            });
          }

          setVideos(allCachedVideos);
          setLastVideoCount(allCachedVideos.length);
          return { ...prevData, cachedVideos: newCachedVideos };
        });

        setLastPollTimestamp(Date.now());
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, data.pollingInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [data.pollingEnabled, data.pollingInterval, data.apiKey, data.channels, data.cachedVideos, lastVideoCount]);

  useEffect(() => {
    if (videos.length > 0) setLastVideoCount(videos.length);
  }, [videos]);

  const fetchVideos = async () => {
    setData(currentData => {
      const channelsToFetch = currentData.channels;
      const labelFilter = selectedLabel;

      if (channelsToFetch.length === 0) {
        setVideos([]);
        return currentData;
      }

      setLoading(true);

      (async () => {
        const filteredChannels = labelFilter
          ? channelsToFetch.filter(channel => channel.labels?.includes(labelFilter))
          : channelsToFetch;

        if (filteredChannels.length === 0) { setLoading(false); return; }

        try {
          const allVideos = await getAllVideos(filteredChannels, currentData.apiKey);
          handleApiCall(filteredChannels.length);

          setData(prevData => {
            const newCachedVideos = { ...prevData.cachedVideos };
            allVideos.forEach(video => { newCachedVideos[video.id] = video; });
            const allCachedVideos = Object.values(newCachedVideos)
              .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            setVideos(allCachedVideos);
            setLastVideoCount(allCachedVideos.length);
            return { ...prevData, cachedVideos: newCachedVideos };
          });
        } catch {
          notifications.show({
            title: 'Error',
            message: 'Error fetching videos. Check your API key.',
            color: 'red',
          });
        } finally {
          setLoading(false);
        }
      })();

      return currentData;
    });
  };

  const handleApiKeySet = (apiKey: string) => {
    const newData = { ...data, apiKey };
    setData(newData);
    saveData(newData);
  };

  const handleApiCall = (callCount: number = 1) => {
    setData(prevData => {
      const newData = { ...prevData, apiCallCount: prevData.apiCallCount + callCount };
      saveData(newData);
      return newData;
    });
  };

  const handleAddChannel = (channel: Channel) => {
    const channelWithLabels = { ...channel, labels: channel.labels || [] };
    setData(prevData => {
      const newData = { ...prevData, channels: [...prevData.channels, channelWithLabels] };
      saveData(newData);
      return newData;
    });
  };

  const handleRemoveChannel = (channelId: string) => {
    setData(prevData => {
      const newData = { ...prevData, channels: prevData.channels.filter(c => c.id !== channelId) };
      saveData(newData);
      return newData;
    });
  };

  const handleAddLabel = (label: string) => {
    setData(prevData => {
      const newData = { ...prevData, labels: [...prevData.labels, label] };
      saveData(newData);
      return newData;
    });
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setData(prevData => {
      const updatedChannels = prevData.channels.map(channel => ({
        ...channel,
        labels: channel.labels?.filter(label => label !== labelToRemove) || [],
      }));
      const newData = {
        ...prevData,
        labels: prevData.labels.filter(label => label !== labelToRemove),
        channels: updatedChannels,
      };
      saveData(newData);
      return newData;
    });
  };

  const handleRenameLabel = (oldLabel: string, newLabel: string) => {
    setData(prevData => {
      const updatedChannels = prevData.channels.map(channel => ({
        ...channel,
        labels: channel.labels?.map(label => label === oldLabel ? newLabel : label) || [],
      }));
      const newData = {
        ...prevData,
        labels: prevData.labels.map(label => label === oldLabel ? newLabel : label),
        channels: updatedChannels,
      };
      saveData(newData);
      return newData;
    });
  };

  const handleUpdateChannelLabels = (channelId: string, labels: string[]) => {
    setData(prevData => {
      const updatedChannels = prevData.channels.map(channel =>
        channel.id === channelId ? { ...channel, labels } : channel
      );
      const newData = { ...prevData, channels: updatedChannels };
      saveData(newData);
      return newData;
    });
  };

  const handleEditChannelLabels = (channel: Channel) => {
    setEditingChannel(channel);
    setShowChannelLabelEditor(true);
  };

  const handleExport = () => { exportData(data); };

  const handleImport = async (file: File) => {
    try {
      const importedData = await importData(file);
      if (Array.isArray(importedData.watchedVideos)) {
        importedData.watchedVideos = new Set(importedData.watchedVideos);
      }
      if (importedData.channels) {
        importedData.channels = importedData.channels.map(channel => ({
          ...channel,
          labels: channel.labels || [],
        }));
      }
      if (!importedData.labels) importedData.labels = [];

      setData(importedData);
      saveData(importedData);

      if (importedData.cachedVideos && Object.keys(importedData.cachedVideos).length > 0) {
        const cachedVideosList = Object.values(importedData.cachedVideos)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setVideos(cachedVideosList);
        setLastVideoCount(cachedVideosList.length);
      }

      if (importedData.channels.length > 0 && importedData.apiKey) {
        setHighlightRefreshButton(true);
      }
    } catch {
      notifications.show({ title: 'Import Error', message: 'Invalid file format.', color: 'red' });
    }
  };

  const handleRefresh = () => {
    setHighlightRefreshButton(false);
    fetchVideos();
  };

  const handleToggleWatched = (videoId: string) => {
    const newWatchedVideos = new Set(data.watchedVideos);
    if (newWatchedVideos.has(videoId)) {
      newWatchedVideos.delete(videoId);
    } else {
      newWatchedVideos.add(videoId);
    }
    const newData = { ...data, watchedVideos: newWatchedVideos };
    setData(newData);
    saveData(newData);
  };

  const handleApiKeyChange = (apiKey: string) => {
    const newData = { ...data, apiKey };
    setData(newData);
    saveData(newData);
  };

  const handlePollingChange = (enabled: boolean, interval: number) => {
    const newData = { ...data, pollingEnabled: enabled, pollingInterval: interval };
    setData(newData);
    saveData(newData);
  };

  const handlePersonalizationChange = (appTitle: string, accentColor: string) => {
    const newData = { ...data, appTitle, accentColor };
    setData(newData);
    saveData(newData);
  };

  useEffect(() => {
    const color = data.accentColor || '#e03131';
    document.documentElement.style.setProperty('--accent-red', color);
    
    let r = 224, g = 49, b = 49;
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    }
    document.documentElement.style.setProperty('--accent-red-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
  }, [data.accentColor]);

  let filteredVideos = videos.filter(video => {
    if (selectedChannelId && video.channelId !== selectedChannelId) return false;
    if (selectedLabel) {
      const channel = data.channels.find(c => c.id === video.channelId);
      if (!channel || !channel.labels?.includes(selectedLabel)) return false;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = video.title.toLowerCase().includes(query);
      const matchesChannel = video.channelTitle.toLowerCase().includes(query);
      if (!matchesTitle && !matchesChannel) return false;
    }

    // Unwatched filter
    if (showUnwatchedOnly && data.watchedVideos.has(video.id)) return false;

    return true;
  });

  filteredVideos = [...filteredVideos].sort((a, b) => {
    switch (videoSortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'oldest':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'channel':
        return a.channelTitle.localeCompare(b.channelTitle);
      case 'unwatched': {
        const aWatched = data.watchedVideos.has(a.id);
        const bWatched = data.watchedVideos.has(b.id);
        if (aWatched === bWatched) return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        return aWatched ? 1 : -1;
      }
      default:
        return 0;
    }
  });

  const getDisplayTitle = () => {
    if (selectedChannelId) {
      const channel = data.channels.find(c => c.id === selectedChannelId);
      return channel?.title || 'Channel Videos';
    }
    if (selectedLabel) return selectedLabel;
    return 'All Videos';
  };

  if (!data.apiKey) {
    return <LandingPage onApiKeySet={handleApiKeySet} />;
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'channel', label: 'Channel' },
    { value: 'unwatched', label: 'Unwatched' },
  ];

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileNavOpened, desktop: !desktopNavOpened },
      }}
      padding={0}
    >
      <AppShell.Header
        className="glass"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group wrap="nowrap" gap="sm">
            <Burger
              opened={mobileNavOpened}
              onClick={mobileNav.toggle}
              hiddenFrom="sm"
              size="sm"
              color="white"
            />
            <Burger
              opened={desktopNavOpened}
              onClick={desktopNav.toggle}
              visibleFrom="sm"
              size="sm"
              color="white"
            />
            <Group gap="xs" wrap="nowrap">
              <Box
                w={32}
                h={32}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-red), #ff6b6b)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(224, 49, 49, 0.3)',
                }}
              >
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Box>
              <div>
                <Text fw={700} size="sm" c="white" lh={1.2}>{data.appTitle || 'MyTube'}</Text>
                <Text size="xs" c="dimmed" lh={1}>Distraction-free</Text>
              </div>
            </Group>
          </Group>
          <Group wrap="nowrap" flex={1} justify="center" px="xl" visibleFrom="md">
            <TextInput
              placeholder="Search videos or channels..."
              leftSection={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              variant="filled"
              size="sm"
              w="100%"
              style={{ maxWidth: 500 }}
              radius="xl"
              styles={{
                input: {
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderColor: 'var(--accent-red)',
                    boxShadow: '0 0 0 1px var(--accent-red)',
                  }
                }
              }}
              rightSection={
                searchQuery && (
                  <MantineActionIcon size="sm" variant="subtle" color="dimmed" onClick={() => setSearchQuery('')}>
                    <Text size="xs">✕</Text>
                  </MantineActionIcon>
                )
              }
            />
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed" visibleFrom="sm">
              {data.channels.length} channels · {data.apiCallCount} API calls
            </Text>
            {data.pollingEnabled && (
              <Badge color="green" variant="light" size="sm" visibleFrom="sm">
                Live
              </Badge>
            )}
            <Settings
              apiKey={data.apiKey}
              pollingEnabled={data.pollingEnabled}
              pollingInterval={data.pollingInterval}
              appTitle={data.appTitle}
              accentColor={data.accentColor}
              onApiKeyChange={handleApiKeyChange}
              onPollingChange={handlePollingChange}
              onPersonalizationChange={handlePersonalizationChange}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        className="glass-navbar"
        style={{
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <ChannelsSidebar
          channels={data.channels}
          labels={data.labels}
          videos={videos}
          watchedVideos={data.watchedVideos}
          selectedChannelId={selectedChannelId}
          selectedLabel={selectedLabel}
          onChannelSelect={setSelectedChannelId}
          onLabelSelect={setSelectedLabel}
          onManageChannelsClick={() => setShowChannelManager(true)}
          onManageLabelsClick={() => setShowLabelManager(true)}
        />
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'transparent', minHeight: '100vh' }}>
        <Box p="lg">
          <Flex justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
            <div>
              <Group gap="xs" align="center">
                <Text fw={700} size="xl" c="white">{getDisplayTitle()}</Text>
                {(selectedChannelId || selectedLabel) && (
                  <Button
                    variant="subtle"
                    size="compact-xs"
                    color="red"
                    onClick={() => { setSelectedChannelId(undefined); setSelectedLabel(undefined); }}
                  >
                    Clear filter
                  </Button>
                )}
              </Group>
              <Group gap="xs" mt={2}>
                <Text size="sm" c="dimmed">
                  {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                </Text>
                <Text size="sm" c="dimmed">·</Text>
                <Text size="sm" c="dimmed">
                  {filteredVideos.filter(v => !data.watchedVideos.has(v.id)).length} unwatched
                </Text>
              </Group>
            </div>

            <Group gap="xs">
              {highlightRefreshButton && (
                <Text size="xs" c="red">Click to fetch latest</Text>
              )}
              <Tooltip label={showUnwatchedOnly ? "Show all videos" : "Show unwatched only"}>
                <Button
                  variant={showUnwatchedOnly ? 'light' : 'default'}
                  color={showUnwatchedOnly ? 'blue' : undefined}
                  size="sm"
                  leftSection={<Filter size={14} />}
                  onClick={() => setShowUnwatchedOnly(!showUnwatchedOnly)}
                >
                  {showUnwatchedOnly ? 'Unwatched' : 'All'}
                </Button>
              </Tooltip>
              
              <Tooltip label="Refresh videos">
                <Button
                  variant={highlightRefreshButton ? 'filled' : 'default'}
                  color={highlightRefreshButton ? 'red' : undefined}
                  size="sm"
                  leftSection={<RefreshCw size={14} />}
                  onClick={handleRefresh}
                  loading={loading}
                  disabled={data.channels.length === 0}
                >
                  Refresh
                </Button>
              </Tooltip>
            </Group>

          </Flex>

          {(filteredVideos.length > 0 || loading) && (
            <Box
              mb="lg"
              p="sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <ActionIcon variant="subtle" size="sm" aria-label="Sort options">
                    <ArrowUpDown size={14} />
                  </ActionIcon>
                  <Text size="xs" c="dimmed" fw={500}>Sort by</Text>
                </Group>
              </Group>
              <SegmentedControl
                size="xs"
                value={videoSortBy}
                onChange={(v) => setVideoSortBy(v as VideoSortOption)}
                data={sortOptions}
                styles={{
                  root: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' },
                }}
              />
            </Box>
          )}

          <VideoGrid
            videos={filteredVideos}
            channels={data.channels}
            loading={loading}
            watchedVideos={data.watchedVideos}
            onToggleWatched={handleToggleWatched}
          />

          <Footer />
        </Box>
      </AppShell.Main>

      <ChannelManager
        channels={data.channels}
        labels={data.labels}
        onAddChannel={handleAddChannel}
        onRemoveChannel={handleRemoveChannel}
        onUpdateChannelLabels={handleUpdateChannelLabels}
        onExport={handleExport}
        onImport={handleImport}
        apiKey={data.apiKey}
        onApiCall={() => handleApiCall(1)}
        showManager={showChannelManager}
        onClose={() => setShowChannelManager(false)}
        onEditChannelLabels={handleEditChannelLabels}
      />

      <LabelManager
        labels={data.labels}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
        onRenameLabel={handleRenameLabel}
        showManager={showLabelManager}
        onClose={() => setShowLabelManager(false)}
      />

      {editingChannel && (
        <ChannelLabelEditor
          channel={editingChannel}
          availableLabels={data.labels}
          onUpdateLabels={handleUpdateChannelLabels}
          showEditor={showChannelLabelEditor}
          onClose={() => {
            setShowChannelLabelEditor(false);
            setEditingChannel(null);
          }}
        />
      )}
    </AppShell>
  );
}

export default App;
