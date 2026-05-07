import React, { useState } from 'react';
import {
  SimpleGrid,
  Box,
  Text,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
  Modal,
  Button,
  AspectRatio,
  Skeleton,
  Avatar,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ExternalLink, Eye, EyeOff, Check, Play, SearchX } from 'lucide-react';
import { Channel, Video } from '../types';

interface VideoGridProps {
  videos: Video[];
  channels: Channel[];
  loading: boolean;
  watchedVideos: Set<string>;
  onToggleWatched: (videoId: string) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

interface VideoCardProps {
  video: Video;
  channel?: Channel;
  watched: boolean;
  onSelect: () => void;
  onToggleWatched: (e: React.MouseEvent) => void;
}

function VideoCard({ video, channel, watched, onSelect, onToggleWatched }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      className="video-card animate-fade-in-up"
      style={{ 
        cursor: 'pointer',
        animationDelay: `${Math.min(10, 0) * 0.05}s` // This will be handled in the grid
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Stack gap="xs">
        {/* Thumbnail */}
        <Box pos="relative" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          <AspectRatio ratio={16 / 9}>
            <img
              src={video.thumbnail}
              alt={video.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: watched ? 'brightness(0.6)' : 'brightness(1)',
                transition: 'filter 0.2s, transform 0.2s',
                transform: hovered ? 'scale(1.02)' : 'scale(1)',
              }}
            />
          </AspectRatio>

          {/* Hover overlay */}
          <Box
            pos="absolute"
            top={0} left={0} right={0} bottom={0}
            style={{
              background: 'rgba(0,0,0,0.35)',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onSelect}
          >
            <Box
              style={{
                background: 'linear-gradient(135deg, var(--accent-red), #ff6b6b)',
                borderRadius: '50%',
                width: 54,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: hovered ? 'scale(1)' : 'scale(0.8)',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(224, 49, 49, 0.5)',
              }}
            >
              <Play size={20} fill="white" color="white" />
            </Box>
          </Box>

          {/* Watched badge */}
          {watched && (
            <Box pos="absolute" top={6} right={6}>
              <Box
                style={{
                  background: '#2f9e44',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={12} color="white" />
              </Box>
            </Box>
          )}

          {/* Quick actions */}
          <Box
            pos="absolute"
            top={8}
            left={8}
            style={{ 
              opacity: hovered ? 1 : 0, 
              transition: 'opacity 0.2s',
              zIndex: 10 
            }}
          >
            <Tooltip label={watched ? 'Mark unwatched' : 'Mark watched'} position="right">
              <ActionIcon
                size="md"
                variant="filled"
                color={watched ? 'blue' : 'dark'}
                radius="xl"
                aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
                onClick={onToggleWatched}
                style={{ 
                  background: watched ? 'rgba(34, 139, 230, 0.9)' : 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {watched ? <EyeOff size={16} /> : <Eye size={16} />}
              </ActionIcon>
            </Tooltip>
          </Box>
        </Box>

        {/* Info */}
        <Group align="flex-start" wrap="nowrap" gap="sm" px="sm" pb="md">
          <Avatar
            src={channel?.thumbnail}
            size={32}
            radius="xl"
            style={{ 
              flexShrink: 0, 
              marginTop: 4, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {!channel?.thumbnail && (
              <Text size="xs" fw={700} c="white">
                {video.channelTitle.charAt(0).toUpperCase()}
              </Text>
            )}
          </Avatar>
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Text
              size="sm"
              fw={600}
              c={watched ? 'dimmed' : 'white'}
              lineClamp={2}
              style={{ cursor: 'pointer', lineHeight: 1.4 }}
              onClick={onSelect}
            >
              {video.title}
            </Text>
            <Group gap={6} wrap="nowrap">
              <Text size="xs" c="dimmed" truncate>{video.channelTitle}</Text>
              <Text size="xs" c="dimmed">•</Text>
              <Text size="xs" c="dimmed">{formatDate(video.publishedAt)}</Text>
            </Group>
          </Stack>
        </Group>
      </Stack>
    </Box>
  );
}

export default function VideoGrid({ videos, channels, loading, watchedVideos, onToggleWatched }: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const handleSelect = (video: Video) => {
    setSelectedVideo(video);
    openModal();
  };

  const handleClose = () => {
    closeModal();
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        {Array.from({ length: 12 }).map((_, i) => (
          <Stack key={i} gap="xs">
            <Skeleton h={0} style={{ paddingBottom: '56.25%' }} radius="md" />
            <Skeleton h={14} w="90%" radius="sm" />
            <Skeleton h={12} w="60%" radius="sm" />
            <Skeleton h={11} w="40%" radius="sm" />
          </Stack>
        ))}
      </SimpleGrid>
    );
  }

  if (videos.length === 0) {
    return (
      <Center py={100}>
        <Stack align="center" gap="md">
          <Box
            w={80}
            h={80}
            style={{
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchX size={32} color="rgba(255,255,255,0.2)" />
          </Box>
          <div style={{ textAlign: 'center' }}>
            <Text c="white" size="lg" fw={600}>No videos found</Text>
            <Text c="dimmed" size="sm" mt={4}>Try adjusting your filters or search query</Text>
          </div>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
        {videos.map((video, index) => (
          <div key={video.id} style={{ animationDelay: `${(index % 12) * 0.05}s` }} className="animate-fade-in-up">
            <VideoCard
              video={video}
              channel={channels.find(c => c.id === video.channelId)}
              watched={watchedVideos.has(video.id)}
              onSelect={() => handleSelect(video)}
              onToggleWatched={(e) => { e.stopPropagation(); onToggleWatched(video.id); }}
            />
          </div>
        ))}
      </SimpleGrid>

      <Modal
        opened={modalOpened}
        onClose={handleClose}
        title={
          <Text fw={700} size="md" c="white" lineClamp={2} style={{ maxWidth: 520 }}>
            {selectedVideo?.title}
          </Text>
        }
        size="xl"
        centered
        overlayProps={{ backgroundOpacity: 0.85, blur: 16 }}
        styles={{
          header: { background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)' },
          body: { background: 'var(--glass-bg)', padding: 0 },
          content: { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' },
        }}
      >
        {selectedVideo && (
          <>
            <Box style={{ background: '#000' }}>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&modestbranding=1&rel=0`}
                  title={selectedVideo.title}
                  style={{ border: 0, width: '100%', height: '100%' }}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onLoad={() => {
                    if (!watchedVideos.has(selectedVideo.id)) {
                      onToggleWatched(selectedVideo.id);
                    }
                  }}
                />
              </AspectRatio>
            </Box>

            <Box p="md">
              <Group justify="space-between" mb="sm">
                <div>
                  <Text size="sm" c="dimmed">{selectedVideo.channelTitle}</Text>
                  <Text size="xs" c="dimmed">{formatDate(selectedVideo.publishedAt)}</Text>
                </div>
                <Group gap="xs">
                  <Button
                    component="a"
                    href={`https://youtube.com/watch?v=${selectedVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="filled"
                    color="red"
                    size="sm"
                    leftSection={<ExternalLink size={14} />}
                  >
                    Watch on YouTube
                  </Button>
                  <Button
                    variant={watchedVideos.has(selectedVideo.id) ? 'filled' : 'default'}
                    color={watchedVideos.has(selectedVideo.id) ? 'green' : undefined}
                    size="sm"
                    leftSection={<Eye size={14} />}
                    onClick={() => onToggleWatched(selectedVideo.id)}
                  >
                    {watchedVideos.has(selectedVideo.id) ? 'Watched' : 'Mark Watched'}
                  </Button>
                </Group>
              </Group>

              {selectedVideo.description && (
                <Box
                  p="sm"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedVideo.description.substring(0, 300)}
                    {selectedVideo.description.length > 300 && '...'}
                  </Text>
                </Box>
              )}
            </Box>
          </>
        )}
      </Modal>
    </>
  );
}
