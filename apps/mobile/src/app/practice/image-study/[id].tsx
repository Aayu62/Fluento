'use client';

import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image as RNImage,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import type { Image, ChallengeMode } from '@fluento/shared';

export default function MobileImageStudyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [image, setImage] = useState<Image | null>(null);
  const [mode, setMode] = useState<ChallengeMode>('standard');
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get<Image>(`/images/${id}`)
      .then((res) => {
        if (mounted) setImage(res.data);
      })
      .catch(() => {
        if (mounted) {
          setImage({
            id: id ?? 'demo',
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            difficulty: 'intermediate',
            metadata: {
              sceneType: 'beach',
              primaryObjects: ['beach', 'ocean', 'sun'],
              secondaryObjects: [],
              activities: ['relaxing'],
              relationships: [],
              atmosphere: ['peaceful'],
              referenceDescription: 'A quiet tropical beach.',
              advancedDescription: 'A tranquil coastline with clear blue water.',
            },
            createdAt: new Date().toISOString(),
          });
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async () => {
    if (!responseText.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/challenges/image/submit', {
        imageId: id,
        mode,
        responseText: responseText.trim(),
      });
      router.replace(`/practice/image-study/${id}/report`);
    } catch {
      router.replace(`/practice/image-study/${id}/report`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>IMAGE STUDY SESSION</Text>
      <Text style={styles.title}>Visual Observation</Text>

      {isLoading ? (
        <ActivityIndicator color="#C4623B" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.stack}>
          {/* Image Card */}
          <View style={styles.imageCard}>
            <RNImage
              source={{
                uri:
                  image?.imageUrl ||
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
              }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Mode Instructions */}
          <View style={styles.modeCard}>
            <Text style={styles.modeBadge}>{mode.replace('_', ' ')} MODE</Text>
            <Text style={styles.modeText}>
              Describe this scene in detail. Focus on main subjects, secondary objects, spatial arrangement, and atmosphere.
            </Text>
          </View>

          {/* Response Form */}
          <View style={styles.inputCard}>
            <Text style={styles.cardLabel}>Your Description</Text>
            <TextInput
              value={responseText}
              onChangeText={setResponseText}
              placeholder="Type your descriptive response..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              style={styles.textArea}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting || !responseText.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Description →</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 2, color: '#17324D', opacity: 0.7, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#17324D', marginBottom: 16 },
  stack: { gap: 16 },
  imageCard: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', height: 220, elevation: 2 },
  image: { width: '100%', height: '100%' },
  modeCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderLeftWidth: 4, borderLeftColor: '#C4623B' },
  modeBadge: { fontSize: 11, fontWeight: '700', color: '#C4623B', textTransform: 'uppercase', marginBottom: 4 },
  modeText: { fontSize: 13, color: '#17324D', lineHeight: 18 },
  inputCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 },
  cardLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 },
  textArea: { backgroundColor: '#F7F3EB', borderRadius: 16, padding: 14, fontSize: 14, color: '#17324D', minHeight: 120, textAlignVertical: 'top', marginBottom: 16 },
  submitButton: { backgroundColor: '#C4623B', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
