import { apiClient } from '@/lib/api/client';

export async function registerPushToken(token: string, platform: 'ios' | 'android' | 'web') {
  try {
    await apiClient.post('/notifications/push-token', {
      token,
      platform,
    });
  } catch {
    // Graceful fallback for mock or offline dev
  }
}

export async function handleIncomingCallAction(
  callId: string,
  action: 'accept' | 'decline',
  onAccepted?: () => void,
) {
  if (action === 'accept') {
    try {
      await apiClient.post(`/calls/${callId}/start`);
    } catch {
      // Ignore API failure for demo fallback
    }
    if (onAccepted) onAccepted();
  } else {
    try {
      await apiClient.post(`/calls/${callId}/decline`);
    } catch {
      // Ignore API failure for demo fallback
    }
  }
}
