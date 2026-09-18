import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { setAuthToken } from '@/lib/api/client';
import { registerPushToken } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api/auth.api';

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, token, setAuth } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    
    const initPush = async () => {
      try {
        if (Platform.OS === 'web') return;
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;
        
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        if (pushToken.data) {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('expo_push_token', pushToken.data);
          registerPushToken(pushToken.data, Platform.OS as 'ios' | 'android');
        }
      } catch (e) {
        console.log('Failed to get push token:', e);
      }
    };
    initPush();
  }, [token]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && !isAuthenticated) {
        try {
          const res = await authApi.syncGoogleAuth(session.access_token);
          setAuthToken(session.access_token);
          setAuth(
            {
              id: res.user.id,
              email: res.user.email,
              fullName: res.user.fullName,
              createdAt: '',
              updatedAt: '',
            },
            session.access_token
          );
        } catch (e) {
          console.error('Failed to sync auth', e);
        }
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isAuthenticated, setAuth]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#F7F3EB" />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </>
  );
}
