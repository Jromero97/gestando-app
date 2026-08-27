import { api } from './api';

export async function registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
  await api.post('/users/me/push-tokens', { token, platform });
}

export async function removePushToken(token: string): Promise<void> {
  await api.delete('/users/me/push-tokens', { data: { token } });
}
