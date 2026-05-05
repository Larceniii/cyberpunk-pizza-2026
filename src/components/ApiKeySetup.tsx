import React, { useState } from 'react';
import {
  Box,
  TextInput,
  Button,
  Text,
  Stack,
  Group,
  Anchor,
  Paper,
} from '@mantine/core';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

export default function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) onApiKeySet(apiKey.trim());
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #111111 50%, #0d0d0d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Box maw={440} w="100%">
        <Stack align="center" mb="xl" gap="xs">
          <Box
            w={56}
            h={56}
            style={{
              background: 'linear-gradient(135deg, #e03131, #c92a2a)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(224,49,49,0.3)',
            }}
          >
            <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </Box>
          <Text fw={800} size="2xl" c="white">MyTube</Text>
          <Text c="dimmed" size="sm" ta="center">
            Distraction-free YouTube aggregator
          </Text>
        </Stack>

        <Paper
          p="xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <div>
                <Text fw={600} c="white" mb="xs" size="sm">YouTube Data API Key</Text>
                <TextInput
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  size="md"
                  leftSection={<Key size={16} />}
                  required
                  styles={{
                    input: {
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white',
                    },
                  }}
                />
              </div>
              <Button
                type="submit"
                color="red"
                size="md"
                fullWidth
                disabled={!apiKey.trim()}
              >
                Get Started
              </Button>
            </Stack>
          </form>

          <Box
            mt="lg"
            p="md"
            style={{
              background: 'rgba(29,130,207,0.1)',
              border: '1px solid rgba(29,130,207,0.2)',
              borderRadius: 10,
            }}
          >
            <Text size="sm" c="blue.3" fw={600} mb="xs">Need an API key?</Text>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">1. Go to Google Cloud Console</Text>
              <Text size="xs" c="dimmed">2. Create or select a project</Text>
              <Text size="xs" c="dimmed">3. Enable YouTube Data API v3</Text>
              <Text size="xs" c="dimmed">4. Create credentials (API Key)</Text>
            </Stack>
            <Group mt="sm" gap="xs">
              <ExternalLink size={12} color="rgba(147,197,253,0.8)" />
              <Anchor
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                size="xs"
                c="blue.3"
              >
                Open Google Cloud Console
              </Anchor>
            </Group>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
