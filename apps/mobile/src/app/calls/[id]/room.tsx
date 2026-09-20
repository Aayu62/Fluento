'use client';
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// import { Audio } from 'expo-av'; // Dynamically imported
import * as FileSystem from 'expo-file-system';
import { apiClient } from '@/lib/api/client';
import type { ScheduledCall } from '@fluento/shared';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

export default function MobileCallRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [call, setCall] = useState<ScheduledCall | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [inputText, setInputText] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const initCall = async () => {
      try {
        const { data } = await apiClient.get<ScheduledCall>(`/calls/${id}`);
        if (!mounted) return;
        setCall(data);

        const { data: turnData } = await apiClient.get<Turn[]>(`/calls/${id}/turns`);
        if (mounted && Array.isArray(turnData)) {
          setTurns(turnData);
          if (turnData.length === 0 && data.scenario) {
            const initialTurn: Turn = {
              role: 'assistant',
              content: `Hello! I'm ${data.scenario.personaName}, your ${data.scenario.personaRole}. ${data.scenario.promptTemplate}`,
            };
            await apiClient.post(`/calls/${id}/turns`, {
              role: 'assistant',
              content: initialTurn.content,
            });
            setTurns([initialTurn]);
            if (isSpeakerOn) {
              playTts(initialTurn.content);
            }
          }
        }
      } catch {
        // Silent catch
      }
    };

    initCall();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const playTts = async (text: string) => {
    try {
      // Cleanup TTS audio if any is playing
      // await (await import('expo-av')).Audio.Sound.createAsync(...) handles its own instances,
      // but in a real app we'd keep track of the sound object and unload it.
      const authHeader = apiClient.defaults.headers.common['Authorization'] as string;
      // @ts-expect-error - cacheDirectory might not be strictly typed in this version
      const fileUri = FileSystem.cacheDirectory + `tts-${Date.now()}.wav`;

      const downloadRes = await FileSystem.downloadAsync(
        `${apiClient.defaults.baseURL}/calls/tts?text=${encodeURIComponent(text)}`,
        fileUri,
        { headers: authHeader ? { Authorization: authHeader } : {} }
      );

      if (downloadRes.status === 200) {
        let Audio;
        try {
          Audio = (await import('expo-av')).Audio;
        } catch (e) {
          console.warn('expo-av not available in Expo Go for Audio playback', e);
          return;
        }
        const { sound } = await Audio.Sound.createAsync({ uri: downloadRes.uri });
        await sound.playAsync();
      }
    } catch (err) {
      console.warn('TTS playback error', err);
    }
  };

  const handleSendTurn = async (contentToSend: string) => {
    if (!contentToSend.trim()) return;

    const userTurn: Turn = { role: 'user', content: contentToSend };
    setTurns((prev) => [...prev, userTurn]);
    setInputText('');

    try {
      const res = await apiClient.post(`/calls/${id}/turns`, { role: 'user', content: contentToSend });
      if (res.data) {
        const assistantTurn = res.data as Turn;
        setTurns((prev) => [...prev, assistantTurn]);
        if (isSpeakerOn && assistantTurn.content) {
          playTts(assistantTurn.content);
        }
      }
    } catch {
      // Catch
    }
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      await apiClient.post(`/calls/${id}/end`);
      router.replace(`/calls/${id}/report`);
    } catch {
      router.replace(`/calls/${id}/report`);
    } finally {
      setIsEnding(false);
    }
  };

  const startRecording = async () => {
    if (isMuted) return;
    try {
      let Audio;
      try {
        Audio = (await import('expo-av')).Audio;
      } catch (e) {
        console.warn('expo-av not available in Expo Go', e);
        return;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsListening(true);
      }
    } catch (err) {
      console.warn('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsListening(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        const authHeader = apiClient.defaults.headers.common['Authorization'] as string;
        const uploadRes = await FileSystem.uploadAsync(
          `${apiClient.defaults.baseURL}/calls/stt`,
          uri,
          {
            httpMethod: 'POST',
            // @ts-expect-error - FileSystemUploadType might not be strictly typed in this version
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'file',
            headers: authHeader ? { Authorization: authHeader } : {}
          }
        );

        if (uploadRes.status === 201 || uploadRes.status === 200) {
          const body = JSON.parse(uploadRes.body);
          if (body && body.text) {
            handleSendTurn(body.text);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to stop recording', err);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{call?.scenario?.personaName ?? 'AI Persona'}</Text>
          <Text style={styles.headerSubtitle}>{call?.scenario?.personaRole ?? 'Coach'}</Text>
        </View>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>

      {/* Transcript Feed */}
      <ScrollView style={styles.transcriptList} contentContainerStyle={{ paddingVertical: 12 }}>
        {turns.map((t, idx) => (
          <View
            key={idx}
            style={[
              styles.turnBubble,
              t.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={t.role === 'user' ? styles.userText : styles.assistantText}>
              {t.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Controls & Input */}
      <View style={styles.footer}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.chip, isMuted && styles.chipActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Text style={[styles.chipText, isMuted && styles.chipTextActive]}>
              {isMuted ? 'Mic Muted' : 'Mic On'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, isSpeakerOn && styles.chipActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <Text style={[styles.chipText, isSpeakerOn && styles.chipTextActive]}>
              {isSpeakerOn ? 'Speaker On' : 'Earpiece'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endButton} onPress={handleEndCall} disabled={isEnding}>
            {isEnding ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.endButtonText}>End Call</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isMuted}
          >
            <Text style={styles.micButtonText}>{isListening ? '...' : 'Mic'}</Text>
          </TouchableOpacity>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your response..."
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSendTurn(inputText)}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3EB' },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D0C0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#17324D' },
  headerSubtitle: { fontSize: 13, color: '#6B7280' },
  timerText: { fontSize: 16, fontWeight: '700', color: '#5D8A6A' },
  transcriptList: { flex: 1, paddingHorizontal: 16 },
  turnBubble: { padding: 14, borderRadius: 18, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: '#17324D', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#D8D0C0' },
  userText: { color: '#FFFFFF', fontSize: 14 },
  assistantText: { color: '#17324D', fontSize: 14 },
  footer: { backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#D8D0C0' },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chip: { backgroundColor: '#F7F3EB', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: '#17324D' },
  chipText: { fontSize: 12, color: '#17324D' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  endButton: { backgroundColor: '#B85450', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8 },
  endButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', gap: 8 },
  micButton: { backgroundColor: '#5D8A6A', borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center' },
  micButtonActive: { backgroundColor: '#C4623B' },
  micButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  textInput: { flex: 1, backgroundColor: '#F7F3EB', borderRadius: 14, padding: 12, fontSize: 14, color: '#17324D' },
  sendButton: { backgroundColor: '#17324D', borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center' },
  sendButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
