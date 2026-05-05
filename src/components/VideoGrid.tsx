import React, { useState } from 'react';
import {
  SimpleGrid,
  Box,
  Text,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  Button,
  AspectRatio,
  Skeleton,
  Image,
  UnstyledButton,
  Avatar,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ExternalLink, Eye, Check, Play } from 'lucide-react';
import { Video } from '../types';

interface VideoGridProps {
  videos: Video[];
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
  watched: boolean;
  onSelect: () => void;
  onToggleWatched: (e: React.MouseEvent) => void;
}

function VideoCard({ video, watched, onSelect, onToggleWatched }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Stack gap="xs">
        {/* Thumbnail */}
        <Box pos="relative" style={{ borderRadius: 10, overflow: 'hidden' }}>
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
                background: 'rgba(224,49,49,0.9)',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: hovered ? 'scale(1)' : 'scale(0.8)',
                transition: 'transform 0.2s',
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

          {/* Eye toggle */}
          <Box
            pos="absolute"
            top={6}
            left={6}
            style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}
          >
            <Tooltip label={watched ? 'Mark unwatched' : 'Mark watched'} position="right">
              <ActionIcon
                size="sm"
                variant="filled"
                color="dark"
                radius="xl"
                aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
                onClick={onToggleWatched}
                style={{ background: 'rgba(0,0,0,0.7)' }}
              >
                <Eye size={12} />
              </ActionIcon>
            </Tooltip>
          </Box>
        </Box>

        {/* Info */}
        <Group align="flex-start" wrap="nowrap" gap="xs" px={2} pb={4}>
          <Avatar
            size={28}
            radius="xl"
            style={{ flexShrink: 0, marginTop: 2, background: 'rgba(255,255,255,0.1)' }}
          >
            <Text size="xs" fw={700} c="white">
              {video.channelTitle.charAt(0).toUpperCase()}
            </Text>
          </Avatar>
          <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
            <Text
              size="sm"
              fw={600}
              c={watched ? 'dimmed' : 'white'}
              lineClamp={2}
              style={{ cursor: 'pointer', lineHeight: 1.35 }}
              onClick={onSelect}
            >
              {video.title}
            </Text>
            <Text size="xs" c="dimmed" truncate mt={2}>{video.channelTitle}</Text>
            <Text size="xs" c="dimmed" mt={1}>{formatDate(video.publishedAt)}</Text>
          </Stack>
        </Group>
      </Stack>
    </Box>
  );
}

export default function VideoGrid({ videos, loading, watchedVideos, onToggleWatched }: VideoGridProps) {
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
      <Center py={80}>
        <Stack align="center" gap="xs">
          <Box
            w={64}
            h={64}
            style={{
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={28} color="rgba(255,255,255,0.2)" />
          </Box>
          <Text c="dimmed" size="lg" fw={500}>No videos found</Text>
          <Text c="dimmed" size="sm">Add channels and refresh to see their latest videos</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            watched={watchedVideos.has(video.id)}
            onSelect={() => handleSelect(video)}
            onToggleWatched={(e) => { e.stopPropagation(); onToggleWatched(video.id); }}
          />
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
        overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
        styles={{
          header: { background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.08)' },
          body: { background: '#1a1a1a', padding: 0 },
          content: { background: '#1a1a1a' },
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
