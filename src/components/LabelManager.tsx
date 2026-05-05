import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Box,
  ScrollArea,
} from '@mantine/core';
import { Plus, Trash2, CreditCard as Edit2, Check, X, Tag } from 'lucide-react';

interface LabelManagerProps {
  labels: string[];
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
  onRenameLabel: (oldLabel: string, newLabel: string) => void;
  showManager: boolean;
  onClose: () => void;
}

const LABEL_COLORS = [
  '#e03131', '#2f9e44', '#1971c2', '#f08c00',
  '#0c8599', '#862e9c', '#c2255c', '#5c7cfa',
  '#20c997', '#fd7e14', '#12b886', '#4dabf7',
];

export default function LabelManager({
  labels,
  onAddLabel,
  onRemoveLabel,
  onRenameLabel,
  showManager,
  onClose,
}: LabelManagerProps) {
  const [newLabel, setNewLabel] = useState('');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const getLabelColor = (label: string) => {
    const index = labels.indexOf(label) % LABEL_COLORS.length;
    return LABEL_COLORS[index];
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      onAddLabel(newLabel.trim());
      setNewLabel('');
    }
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== editingLabel && !labels.includes(editValue.trim())) {
      onRenameLabel(editingLabel!, editValue.trim());
    }
    setEditingLabel(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingLabel(null);
    setEditValue('');
  };

  return (
    <Modal
      opened={showManager}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Tag size={18} color="#e03131" />
          <Text fw={700} size="lg" c="white">Manage Labels</Text>
        </Group>
      }
      size="md"
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
        <form onSubmit={handleAdd}>
          <Group gap="sm">
            <TextInput
              flex={1}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Create new label..."
              styles={{
                input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' },
              }}
            />
            <Button type="submit" color="blue" leftSection={<Plus size={14} />}>
              Add
            </Button>
          </Group>
        </form>

        <Stack gap="xs">
          <Text size="sm" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Labels ({labels.length})
          </Text>

          {labels.length === 0 ? (
            <Box ta="center" py="xl">
              <Tag size={32} color="rgba(255,255,255,0.15)" />
              <Text c="dimmed" size="sm" mt="sm">No labels yet</Text>
              <Text c="dimmed" size="xs" mt={4}>Create labels to organize channels</Text>
            </Box>
          ) : (
            labels.map((label) => (
              <Box
                key={label}
                p="sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Box
                      w={10}
                      h={10}
                      style={{ borderRadius: '50%', background: getLabelColor(label), flexShrink: 0 }}
                    />

                    {editingLabel === label ? (
                      <TextInput
                        flex={1}
                        size="xs"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        styles={{
                          input: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' },
                        }}
                      />
                    ) : (
                      <Text fw={500} c="white" truncate flex={1}>{label}</Text>
                    )}
                  </Group>

                  <Group gap="xs" style={{ flexShrink: 0 }}>
                    {editingLabel === label ? (
                      <>
                        <Tooltip label="Save">
                          <ActionIcon size="sm" color="green" variant="subtle" aria-label="Save" onClick={handleSaveEdit}>
                            <Check size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Cancel">
                          <ActionIcon size="sm" color="gray" variant="subtle" aria-label="Cancel" onClick={handleCancelEdit}>
                            <X size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip label="Rename">
                          <ActionIcon
                            size="sm" color="blue" variant="subtle" aria-label="Rename"
                            onClick={() => { setEditingLabel(label); setEditValue(label); }}
                          >
                            <Edit2 size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            size="sm" color="red" variant="subtle" aria-label="Delete"
                            onClick={() => onRemoveLabel(label)}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </>
                    )}
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
