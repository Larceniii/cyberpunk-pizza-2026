import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Avatar,
  ActionIcon,
  Tooltip,
  Badge,
  Box,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { Plus, Trash2, Download, Upload, Tag, Loader2 } from 'lucide-react';
import { Channel } from '../types';
import { parseChannelUrl, searchChannel, getChannelById } from '../utils/youtube';

interface ChannelManagerProps {
  channels: Channel[];
  labels: string[];
  onAddChannel: (channel: Channel) => void;
  onRemoveChannel: (channelId: string) => void;
  onUpdateChannelLabels: (channelId: string, labels: string[]) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  apiKey: string;
  onApiCall: () => void;
  showManager: boolean;
  onClose: () => void;
  onEditChannelLabels: (channel: Channel) => void;
}

const LABEL_COLORS = [
  '#e03131', '#2f9e44', '#1971c2', '#f08c00',
  '#0c8599', '#862e9c', '#c2255c', '#5c7cfa',
  '#20c997', '#fd7e14', '#12b886', '#4dabf7',
];

const getLabelColor = (labels: string[], label: string) => {
  const index = labels.indexOf(label) % LABEL_COLORS.length;
  return LABEL_COLORS[index];
};

export default function ChannelManager({
  channels,
  labels,
  onAddChannel,
  onRemoveChannel,
  onUpdateChannelLabels,
  onExport,
  onImport,
  apiKey,
  onApiCall,
  showManager,
  onClose,
  onEditChannelLabels,
}: ChannelManagerProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const parsedInput = parseChannelUrl(input);
      if (!parsedInput) { setError('Invalid channel URL or handle'); return; }

      let channel: Channel | null = await searchChannel(parsedInput, apiKey);
      onApiCall();

      if (!channel) {
        channel = await getChannelById(parsedInput, apiKey);
        if (channel) onApiCall();
      }

      if (!channel) { setError('Channel not found. Check the URL or handle.'); return; }
      if (channels.some(c => c.id === channel!.id)) { setError('Channel already added'); return; }

      channel.labels = [];
      onAddChannel(channel);
      setInput('');
      setError('');
    } catch {
      setError('Error adding channel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { onImport(file); e.target.value = ''; }
  };

  return (
    <Modal
      opened={showManager}
      onClose={onClose}
      title={<Text fw={700} size="lg" c="white">Manage Channels</Text>}
      size="lg"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      styles={{
        header: { background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.08)' },
        body: { background: '#1a1a1a', padding: '20px' },
        content: { background: '#1a1a1a' },
      }}
    >
      <Stack gap="md">
        {/* Add channel form */}
        <Box
          p="md"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Text size="sm" fw={600} c="white" mb="sm">Add Channel</Text>
          <form onSubmit={handleSubmit}>
            <Group gap="sm">
              <TextInput
                flex={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="YouTube channel URL or @handle"
                error={error}
                styles={{
                  input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' },
                }}
              />
              <Button
                type="submit"
                color="red"
                loading={isLoading}
                leftSection={<Plus size={14} />}
              >
                Add
              </Button>
            </Group>
          </form>
        </Box>

        {/* Import/Export */}
        <Group gap="sm">
          <Button
            variant="light"
            color="green"
            size="sm"
            leftSection={<Download size={14} />}
            onClick={onExport}
          >
            Export
          </Button>
          <Button
            variant="light"
            color="blue"
            size="sm"
            leftSection={<Upload size={14} />}
            component="label"
          >
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </Button>
        </Group>

        <Divider color="rgba(255,255,255,0.06)" />

        {/* Channels list */}
        <Stack gap="xs">
          <Text size="sm" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Channels ({channels.length})
          </Text>

          {channels.length === 0 ? (
            <Box ta="center" py="xl">
              <Text c="dimmed" size="sm">No channels added yet</Text>
            </Box>
          ) : (
            channels.map((channel) => (
              <Box
                key={channel.id}
                p="sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <Avatar src={channel.thumbnail} alt={channel.title} radius="xl" size={40} style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <Text fw={600} c="white" size="sm" truncate>{channel.title}</Text>
                      {channel.handle && (
                        <Text size="xs" c="dimmed">{channel.handle}</Text>
                      )}
                      {channel.labels && channel.labels.length > 0 && (
                        <Group gap={4} mt={4}>
                          {channel.labels.map((label) => (
                            <Badge
                              key={label}
                              size="xs"
                              variant="filled"
                              style={{ background: getLabelColor(labels, label) }}
                            >
                              {label}
                            </Badge>
                          ))}
                        </Group>
                      )}
                    </div>
                  </Group>
                  <Group gap="xs" style={{ flexShrink: 0 }}>
                    <Tooltip label="Edit labels">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="sm"
                        aria-label="Edit labels"
                        onClick={() => onEditChannelLabels(channel)}
                      >
                        <Tag size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remove channel">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        aria-label="Remove channel"
                        onClick={() => onRemoveChannel(channel.id)}
                      >
                        <Trash2 size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Box>
            ))
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
