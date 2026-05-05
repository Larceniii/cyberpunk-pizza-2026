import { Group, Text, Anchor, Divider, Box } from '@mantine/core';
import { Heart, SquarePlay, MessageCircle, Coffee } from 'lucide-react';

export default function Footer() {
  return (
    <Box mt={64}>
      <Divider color="rgba(255,255,255,0.06)" mb="lg" />
      <Group justify="space-between" wrap="wrap" gap="md" pb="lg">
        <Group gap="xs">
          <Text size="xs" c="dimmed">Made with</Text>
          <Heart size={12} color="#e03131" fill="#e03131" />
          <Text size="xs" c="dimmed">for distraction-free YouTube</Text>
        </Group>

        <Group gap="md">
          <Anchor
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <SquarePlay size={14} color="rgba(255,255,255,0.4)" />
            <Text size="xs" c="dimmed">YouTube</Text>
          </Anchor>

          <Anchor
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MessageCircle size={14} color="rgba(255,255,255,0.4)" />
            <Text size="xs" c="dimmed">Discord</Text>
          </Anchor>

          <Anchor
            href="https://coff.ee/countzero"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#f08c00',
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            <Coffee size={12} color="black" />
            <Text size="xs" fw={600} c="dark">Donate</Text>
          </Anchor>
        </Group>
      </Group>
      <Text size="xs" c="dimmed" ta="center" pb="md" opacity={0.5}>
        MyTube 2025 — Open source YouTube aggregator
      </Text>
    </Box>
  );
}
