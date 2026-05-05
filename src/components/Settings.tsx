import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Switch,
  Slider,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Settings as SettingsIcon, Key, Bell, Clock, Save } from 'lucide-react';

interface SettingsProps {
  apiKey: string;
  pollingEnabled: boolean;
  pollingInterval: number;
  onApiKeyChange: (apiKey: string) => void;
  onPollingChange: (enabled: boolean, interval: number) => void;
}

export default function Settings({
  apiKey,
  pollingEnabled,
  pollingInterval,
  onApiKeyChange,
  onPollingChange,
}: SettingsProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [newPollingEnabled, setNewPollingEnabled] = useState(pollingEnabled);
  const [newPollingInterval, setNewPollingInterval] = useState(pollingInterval);

  const handleOpen = () => {
    setNewApiKey(apiKey);
    setNewPollingEnabled(pollingEnabled);
    setNewPollingInterval(pollingInterval);
    open();
  };

  const handleSave = () => {
    onApiKeyChange(newApiKey);
    onPollingChange(newPollingEnabled, newPollingInterval);
    close();
  };

  const handleCancel = () => {
    setNewApiKey(apiKey);
    setNewPollingEnabled(pollingEnabled);
    setNewPollingInterval(pollingInterval);
    close();
  };

  return (
    <>
      <Tooltip label="Settings">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          aria-label="Settings"
          onClick={handleOpen}
        >
          <SettingsIcon size={18} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={handleCancel}
        title={
          <Group gap="xs">
            <SettingsIcon size={18} color="#e03131" />
            <Text fw={700} size="lg" c="white">Settings</Text>
          </Group>
        }
        size="md"
        centered
        overlayProps={{ backgroundOpacity: 0.7, blur: 4 }}
        styles={{
          header: { background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.08)' },
          body: { background: '#1a1a1a', padding: '20px' },
          content: { background: '#1a1a1a' },
        }}
      >
        <Stack gap="lg">
          {/* API Key */}
          <Box
            p="md"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Group gap="xs" mb="sm">
              <Key size={16} color="#e03131" />
              <Text fw={600} c="white" size="sm">YouTube API Key</Text>
            </Group>
            <TextInput
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter your YouTube Data API key"
              styles={{
                input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' },
              }}
            />
          </Box>

          {/* Polling */}
          <Box
            p="md"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <Bell size={16} color="#e03131" />
                <Text fw={600} c="white" size="sm">Auto-refresh & Notifications</Text>
              </Group>
              <Switch
                checked={newPollingEnabled}
                onChange={(e) => setNewPollingEnabled(e.currentTarget.checked)}
                color="red"
              />
            </Group>

            {newPollingEnabled && (
              <Stack gap="sm">
                <Group gap="xs">
                  <Clock size={14} color="rgba(255,255,255,0.5)" />
                  <Text size="sm" c="dimmed">
                    Check every <Text span fw={600} c="white">{newPollingInterval} minutes</Text>
                  </Text>
                </Group>
                <Slider
                  min={15}
                  max={240}
                  step={15}
                  value={newPollingInterval}
                  onChange={setNewPollingInterval}
                  color="red"
                  marks={[
                    { value: 15, label: '15m' },
                    { value: 60, label: '1h' },
                    { value: 120, label: '2h' },
                    { value: 240, label: '4h' },
                  ]}
                  styles={{
                    track: { background: 'rgba(255,255,255,0.1)' },
                  }}
                />
                <Box
                  p="sm"
                  mt="sm"
                  style={{
                    background: 'rgba(255,193,7,0.1)',
                    borderRadius: 8,
                    border: '1px solid rgba(255,193,7,0.2)',
                  }}
                >
                  <Text size="xs" c="yellow.4">
                    Auto-refresh consumes YouTube API quota. Use longer intervals to preserve quota.
                  </Text>
                </Box>
              </Stack>
            )}
          </Box>

          <Group gap="sm" justify="flex-end">
            <Button variant="default" onClick={handleCancel}>Cancel</Button>
            <Button color="red" leftSection={<Save size={14} />} onClick={handleSave}>
              Save Settings
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
