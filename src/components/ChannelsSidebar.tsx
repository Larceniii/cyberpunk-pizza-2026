import { useState } from 'react';
import {
  ScrollArea,
  Avatar,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Divider,
  Box,
  ActionIcon,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { Tag, Filter, Users, Hash, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Channel, Video } from '../types';

interface ChannelsSidebarProps {
  channels: Channel[];
  labels: string[];
  videos: Video[];
  watchedVideos: Set<string>;
  selectedChannelId?: string;
  selectedLabel?: string;
  onChannelSelect: (channelId: string | undefined) => void;
  onLabelSelect: (label: string | undefined) => void;
  onManageChannelsClick: () => void;
  onManageLabelsClick: () => void;
}

type SortOption = 'alphabetical' | 'recent' | 'subscribers';

const LABEL_COLORS = [
  '#e03131', '#2f9e44', '#1971c2', '#f08c00',
  '#0c8599', '#862e9c', '#c2255c', '#5c7cfa',
  '#20c997', '#fd7e14', '#12b886', '#4dabf7',
];

const getLabelColor = (labels: string[], label: string) => {
  const index = labels.indexOf(label) % LABEL_COLORS.length;
  return LABEL_COLORS[index];
};

export default function ChannelsSidebar({
  channels,
  labels,
  videos,
  watchedVideos,
  selectedChannelId,
  selectedLabel,
  onChannelSelect,
  onLabelSelect,
  onManageChannelsClick,
  onManageLabelsClick,
}: ChannelsSidebarProps) {
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [labelsExpanded, setLabelsExpanded] = useState(true);

  const filteredChannels = selectedLabel
    ? channels.filter(channel => channel.labels?.includes(selectedLabel))
    : channels;

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical': return a.title.localeCompare(b.title);
      case 'subscribers': {
        const aCount = parseInt(a.subscriberCount || '0');
        const bCount = parseInt(b.subscriberCount || '0');
        return bCount - aCount;
      }
      case 'recent': {
        const aLastVideo = videos.filter(v => v.channelId === a.id).sort((v1, v2) => new Date(v2.publishedAt).getTime() - new Date(v1.publishedAt).getTime())[0];
        const bLastVideo = videos.filter(v => v.channelId === b.id).sort((v1, v2) => new Date(v2.publishedAt).getTime() - new Date(v1.publishedAt).getTime())[0];
        if (!aLastVideo) return 1;
        if (!bLastVideo) return -1;
        return new Date(bLastVideo.publishedAt).getTime() - new Date(aLastVideo.publishedAt).getTime();
      }
      default: return a.title.localeCompare(b.title);
    }
  });

  const getUnwatchedCount = (channelId: string) => {
    return videos.filter(v => v.channelId === channelId && !watchedVideos.has(v.id)).length;
  };

  const getLabelUnwatchedCount = (label: string) => {
    const labelChannels = channels.filter(c => c.labels?.includes(label)).map(c => c.id);
    return videos.filter(v => labelChannels.includes(v.channelId) && !watchedVideos.has(v.id)).length;
  };

  const totalUnwatchedCount = videos.filter(v => !watchedVideos.has(v.id)).length;

  const formatSubscriberCount = (count?: string) => {
    if (!count) return '';
    const num = parseInt(count);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Stack gap={0} h="100%" style={{ overflow: 'hidden' }}>
      {/* Sort controls */}
      <Box p="sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Group gap={4} justify="center">
          {(['alphabetical', 'recent', 'subscribers'] as SortOption[]).map((opt) => (
            <Tooltip key={opt} label={opt.charAt(0).toUpperCase() + opt.slice(1)} position="bottom">
              <ActionIcon
                size="sm"
                variant={sortBy === opt ? 'filled' : 'subtle'}
                color={sortBy === opt ? 'red' : 'gray'}
                aria-label={opt}
                onClick={() => setSortBy(opt)}
              >
                {opt === 'alphabetical' && <Hash size={12} />}
                {opt === 'recent' && <Calendar size={12} />}
                {opt === 'subscribers' && <Users size={12} />}
              </ActionIcon>
            </Tooltip>
          ))}
        </Group>
      </Box>

      <ScrollArea flex={1} scrollbars="y" style={{ flex: 1 }}>
        {/* All channels button */}
        <Box p="sm" pb={0}>
          <UnstyledButton
            onClick={() => { onChannelSelect(undefined); onLabelSelect(undefined); }}
            style={{ width: '100%' }}
          >
            <Box
              p="xs"
              style={{
                borderRadius: 8,
                background: !selectedChannelId && !selectedLabel
                  ? 'var(--accent-red-glow)'
                  : 'transparent',
                border: !selectedChannelId && !selectedLabel
                  ? '1px solid var(--accent-red)'
                  : '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              <Group gap="xs" wrap="nowrap">
                <Box
                  w={32}
                  h={32}
                  style={{
                    borderRadius: 10,
                    background: 'var(--glass-border)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Filter size={14} color="rgba(255,255,255,0.6)" />
                </Box>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text size="sm" fw={600} c="white" truncate>All Channels</Text>
                  <Group gap={4}>
                    <Text size="xs" c="dimmed">{channels.length} channels</Text>
                    {totalUnwatchedCount > 0 && (
                      <Badge size="xs" color="red" variant="filled">
                        {totalUnwatchedCount}
                      </Badge>
                    )}
                  </Group>
                </div>
              </Group>
            </Box>
          </UnstyledButton>
        </Box>

        {/* Labels section */}
        {labels.length > 0 && (
          <Box p="sm" pb={0}>
              <Group justify="space-between" mb="xs">
                <UnstyledButton onClick={() => setLabelsExpanded(!labelsExpanded)}>
                  <Group gap="xs">
                    <Tag size={12} color="rgba(255,255,255,0.4)" />
                    <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Labels
                    </Text>
                    {labelsExpanded ? <ChevronDown size={12} color="rgba(255,255,255,0.4)" /> : <ChevronRight size={12} color="rgba(255,255,255,0.4)" />}
                  </Group>
                </UnstyledButton>
                <Button variant="subtle" color="gray" size="compact-xs" onClick={onManageLabelsClick}>
                  Manage
                </Button>
              </Group>

            {labelsExpanded && (
              <Stack gap={2}>
                {labels.map((label) => {
                  const count = channels.filter(c => c.labels?.includes(label)).length;
                  const unwatchedCount = getLabelUnwatchedCount(label);
                  const color = getLabelColor(labels, label);
                  const isSelected = selectedLabel === label;
                  return (
                    <UnstyledButton
                      key={label}
                      onClick={() => onLabelSelect(isSelected ? undefined : label)}
                      style={{ width: '100%' }}
                    >
                      <Box
                        px="xs"
                        py={6}
                        style={{
                          borderRadius: 8,
                          background: isSelected ? `${color}20` : 'transparent',
                          border: `1px solid ${isSelected ? `${color}40` : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}
                        className="sidebar-item-hover"
                      >
                        <Group gap="xs" wrap="nowrap">
                          <Box
                            w={8}
                            h={8}
                            style={{ borderRadius: '50%', background: color, flexShrink: 0 }}
                          />
                          <Text size="sm" c={isSelected ? 'white' : 'dimmed'} truncate flex={1}>{label}</Text>
                          <Group gap={4}>
                            {unwatchedCount > 0 && (
                              <Badge size="xs" color="red" variant="filled">
                                {unwatchedCount}
                              </Badge>
                            )}
                            <Text size="xs" c="dimmed">{count}</Text>
                          </Group>
                        </Group>
                      </Box>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            )}
            <Divider mt="sm" color="rgba(255,255,255,0.06)" />
          </Box>
        )}

        {/* Channels list */}
        <Box p="sm">
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Channels ({sortedChannels.length})
            </Text>
            <Button variant="subtle" color="red" size="compact-xs" onClick={onManageChannelsClick}>
              Manage
            </Button>
          </Group>

          <Stack gap={2}>
            {sortedChannels.map((channel) => {
              const isSelected = selectedChannelId === channel.id;
              return (
                <UnstyledButton
                  key={channel.id}
                  onClick={() => onChannelSelect(isSelected ? undefined : channel.id)}
                  style={{ width: '100%' }}
                >
                  <Box
                    p="xs"
                    style={{
                      borderRadius: 8,
                      background: isSelected ? 'var(--accent-red-glow)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--accent-red)' : 'transparent'}`,
                      transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                    className="sidebar-item-hover"
                  >
                    <Group gap="xs" wrap="nowrap">
                      <Avatar
                        src={channel.thumbnail}
                        alt={channel.title}
                        size={36}
                        radius="xl"
                        style={{ flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Text size="sm" fw={600} c="white" truncate>{channel.title}</Text>
                        <Group gap={4} wrap="nowrap">
                          {channel.handle && (
                            <Text size="xs" c="dimmed" truncate>{channel.handle}</Text>
                          )}
                          {channel.subscriberCount && (
                            <Text size="xs" c="dimmed">
                              {formatSubscriberCount(channel.subscriberCount)}
                            </Text>
                          )}
                          {getUnwatchedCount(channel.id) > 0 && (
                            <Badge size="xs" color="red" variant="filled">
                              {getUnwatchedCount(channel.id)}
                            </Badge>
                          )}
                        </Group>
                        {channel.labels && channel.labels.length > 0 && (
                          <Group gap={3} mt={2}>
                            {channel.labels.slice(0, 3).map((label) => (
                              <Box
                                key={label}
                                w={6}
                                h={6}
                                style={{
                                  borderRadius: '50%',
                                  background: getLabelColor(labels, label),
                                }}
                                title={label}
                              />
                            ))}
                            {channel.labels.length > 3 && (
                              <Text size="xs" c="dimmed">+{channel.labels.length - 3}</Text>
                            )}
                          </Group>
                        )}
                      </div>
                    </Group>
                  </Box>
                </UnstyledButton>
              );
            })}
          </Stack>

          {sortedChannels.length === 0 && selectedLabel && (
            <Box ta="center" py="xl">
              <Tag size={32} color="rgba(255,255,255,0.2)" />
              <Text size="sm" c="dimmed" mt="xs">No channels with "{selectedLabel}"</Text>
            </Box>
          )}

          {channels.length === 0 && !selectedLabel && (
            <Box ta="center" py="xl">
              <Users size={32} color="rgba(255,255,255,0.2)" />
              <Text size="sm" c="dimmed" mt="xs">No channels yet</Text>
            </Box>
          )}
        </Box>
      </ScrollArea>


    </Stack>
  );
}
