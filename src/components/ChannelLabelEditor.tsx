import React, { useState } from 'react';
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Avatar,
  Box,
  ScrollArea,
  UnstyledButton,
} from '@mantine/core';
import { Check, Tag } from 'lucide-react';
import { Channel } from '../types';

interface ChannelLabelEditorProps {
  channel: Channel;
  availableLabels: string[];
  onUpdateLabels: (channelId: string, labels: string[]) => void;
  showEditor: boolean;
  onClose: () => void;
}

const LABEL_COLORS = [
  '#e03131', '#2f9e44', '#1971c2', '#f08c00',
  '#0c8599', '#862e9c', '#c2255c', '#5c7cfa',
  '#20c997', '#fd7e14', '#12b886', '#4dabf7',
];

export default function ChannelLabelEditor({
  channel,
  availableLabels,
  onUpdateLabels,
  showEditor,
  onClose,
}: ChannelLabelEditorProps) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>(channel.labels || []);

  const getLabelColor = (label: string) => {
    const index = availableLabels.indexOf(label) % LABEL_COLORS.length;
    return LABEL_COLORS[index];
  };

  const handleToggle = (label: string) => {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleSave = () => {
    onUpdateLabels(channel.id, selectedLabels);
    onClose();
  };

  return (
    <Modal
      opened={showEditor}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Tag size={18} color="#e03131" />
          <Text fw={700} size="lg" c="white">Edit Labels</Text>
        </Group>
      }
      size="sm"
      centered
      overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
      styles={{
        header: { background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.08)' },
        body: { background: '#1a1a1a', padding: '20px' },
        content: { background: '#1a1a1a' },
      }}
    >
      <Stack gap="md">
        <Box
          p="sm"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Group gap="sm">
            <Avatar src={channel.thumbnail} alt={channel.title} radius="xl" size={40} />
            <div>
              <Text fw={600} c="white" size="sm">{channel.title}</Text>
              {channel.handle && <Text size="xs" c="dimmed">{channel.handle}</Text>}
            </div>
          </Group>
        </Box>

        {availableLabels.length > 0 ? (
          <Stack gap="xs">
            <Text size="sm" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Available Labels
            </Text>
            {availableLabels.map((label) => {
              const isSelected = selectedLabels.includes(label);
              const color = getLabelColor(label);
              return (
                <UnstyledButton key={label} onClick={() => handleToggle(label)} style={{ width: '100%' }}>
                  <Box
                    p="sm"
                    style={{
                      borderRadius: 10,
                      background: isSelected ? `${color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? `${color}50` : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Group justify="space-between">
                      <Group gap="sm">
                        <Box w={10} h={10} style={{ borderRadius: '50%', background: color }} />
                        <Text c="white" size="sm" fw={isSelected ? 600 : 400}>{label}</Text>
                      </Group>
                      {isSelected && <Check size={16} color={color} />}
                    </Group>
                  </Box>
                </UnstyledButton>
              );
            })}
          </Stack>
        ) : (
          <Box ta="center" py="xl">
            <Tag size={32} color="rgba(255,255,255,0.15)" />
            <Text c="dimmed" size="sm" mt="sm">No labels available</Text>
            <Text c="dimmed" size="xs" mt={4}>Create labels first from the sidebar</Text>
          </Box>
        )}

        <Group gap="sm" justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button color="blue" leftSection={<Check size={14} />} onClick={handleSave}>
            Save Labels
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
