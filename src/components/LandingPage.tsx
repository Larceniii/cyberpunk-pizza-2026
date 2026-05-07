import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  Stack,
  Title,
  List,
  ThemeIcon,
  Paper,
  Container,
} from '@mantine/core';
import { ShieldCheck, EyeOff, Smartphone, Info } from 'lucide-react';
import ApiKeySetup from './ApiKeySetup';

interface LandingPageProps {
  onApiKeySet: (apiKey: string) => void;
}

export default function LandingPage({ onApiKeySet }: LandingPageProps) {
  const [showSetup, setShowSetup] = useState(false);

  if (showSetup) {
    return <ApiKeySetup onApiKeySet={onApiKeySet} />;
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #111111 50%, #0d0d0d 100%)',
        padding: '40px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container size="sm" w="100%">
        <Stack align="center" mb="xl" gap="xs">
          <Box
            w={64}
            h={64}
            style={{
              background: 'linear-gradient(135deg, #e03131, #c92a2a)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(224,49,49,0.3)',
            }}
          >
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </Box>
          <Title order={1} c="white" fw={800} mt="md">
            Welcome to MyTube
          </Title>
          <Text c="dimmed" size="lg" ta="center" maw={500}>
            A distraction-free, algorithm-free way to keep up with your favorite YouTube channels.
          </Text>
        </Stack>

        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack gap="xl">
            <div>
              <Title order={3} c="white" mb="sm" fw={600}>
                Why are you asking for my API key?
              </Title>
              <Text c="dimmed" size="sm" lh={1.6}>
                MyTube is a completely client-side application. We do not have a backend server or a database. By using your own YouTube Data API Key, you connect directly to YouTube to fetch your subscriptions.
              </Text>
            </div>

            <List
              spacing="lg"
              size="sm"
              center
              icon={
                <ThemeIcon color="red" size={28} radius="xl" variant="light">
                  <ShieldCheck size={16} />
                </ThemeIcon>
              }
            >
              <List.Item
                icon={
                  <ThemeIcon color="green" size={28} radius="xl" variant="light">
                    <EyeOff size={16} />
                  </ThemeIcon>
                }
              >
                <Text fw={600} c="white">We save nothing & track absolutely nothing.</Text>
                <Text c="dimmed" size="xs" mt={4}>
                  Your data (API key, channels, watched history) is stored strictly in your browser's local storage. We don't know who you are or what you watch.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon color="blue" size={28} radius="xl" variant="light">
                    <Smartphone size={16} />
                  </ThemeIcon>
                }
              >
                <Text fw={600} c="white">Multi-device use is a little clunky.</Text>
                <Text c="dimmed" size="xs" mt={4}>
                  Because we don't save your data to a server, your data is not synced in any way. You have to manually export and import your data if you want to use MyTube on another device.
                </Text>
              </List.Item>

              <List.Item
                icon={
                  <ThemeIcon color="gray" size={28} radius="xl" variant="light">
                    <Info size={16} />
                  </ThemeIcon>
                }
              >
                <Text fw={600} c="white">We make zero guarantees.</Text>
                <Text c="dimmed" size="xs" mt={4}>
                  This is a personal tool provided as-is. We do not guarantee uptime, long-term support, or flawless functionality.
                </Text>
              </List.Item>
            </List>

            <Button
              color="red"
              size="lg"
              fullWidth
              mt="md"
              onClick={() => setShowSetup(true)}
              styles={{
                root: {
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }
              }}
            >
              I Understand, Continue to Setup
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
