import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { UserGoal, SkillLevel } from '@fluento/shared';

const GOALS: { value: UserGoal; label: string; description: string }[] = [
  { value: 'interview_preparation', label: 'Interview Preparation', description: 'Crack HR and technical interviews' },
  { value: 'improve_fluency', label: 'Improve Fluency', description: 'Speak smoothly without hesitation' },
  { value: 'sales_practice', label: 'Sales Practice', description: 'Pitch products and close deals' },
  { value: 'general_communication', label: 'General Communication', description: 'Everyday professional conversations' },
];

const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'I struggle to express myself clearly' },
  { value: 'intermediate', label: 'Intermediate', description: 'I can communicate but lack confidence' },
  { value: 'advanced', label: 'Advanced', description: 'I communicate well but want to refine' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setProfile } = useAuthStore();

  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<UserGoal[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleGoal(goal: UserGoal) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  async function handleFinish() {
    if (!selectedLevel || selectedGoals.length === 0) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/users/onboarding', {
        goals: selectedGoals,
        skillLevel: selectedLevel,
      });
      setProfile(data);
      router.replace('/(tabs)');
    } catch {
      setLoading(false);
    }
  }

  // ─── Step 0: Welcome ────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>WELCOME TO FLUENTO</Text>
        <Text style={styles.title}>Your Communication{'\n'}Journey Begins</Text>
        <Text style={styles.body}>
          Practice real conversations, build confidence, and communicate effectively through
          structured daily practice.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => setStep(1)} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Step 1: Goals ──────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.stepLabel}>STEP 1 OF 2</Text>
        <Text style={styles.stepTitle}>What are your goals?</Text>
        <Text style={styles.stepSubtitle}>Select all that apply.</Text>

        {GOALS.map((goal) => {
          const selected = selectedGoals.includes(goal.value);
          return (
            <TouchableOpacity
              key={goal.value}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => toggleGoal(goal.value)}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {goal.label}
              </Text>
              <Text style={[styles.optionDesc, selected && styles.optionDescSelected]}>
                {goal.description}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.button, selectedGoals.length === 0 && styles.buttonDisabled]}
          onPress={() => setStep(2)}
          disabled={selectedGoals.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Step 2: Skill Level ─────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.stepLabel}>STEP 2 OF 2</Text>
      <Text style={styles.stepTitle}>Your current level?</Text>
      <Text style={styles.stepSubtitle}>This personalises your practice sessions.</Text>

      {SKILL_LEVELS.map((level) => {
        const selected = selectedLevel === level.value;
        return (
          <TouchableOpacity
            key={level.value}
            style={[styles.optionCard, selected && styles.optionCardSelected]}
            onPress={() => setSelectedLevel(level.value)}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {level.label}
            </Text>
            <Text style={[styles.optionDesc, selected && styles.optionDescSelected]}>
              {level.description}
            </Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.buttonSecondary, { flex: 1, marginRight: 8 }]}
          onPress={() => setStep(1)}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { flex: 1 }, (!selectedLevel || loading) && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={!selectedLevel || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Enter Journal</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F7F3EB',
    padding: 24,
    paddingTop: 64,
  },
  label: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#17324D80',
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#17324D',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  body: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 14,
    color: '#17324DB3',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  stepLabel: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#17324D80',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 13,
    color: '#17324D99',
    marginBottom: 24,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#D8D0C0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F7F3EB',
  },
  optionCardSelected: { backgroundColor: '#17324D', borderColor: '#17324D' },
  optionLabel: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 14,
    fontWeight: '600',
    color: '#17324D',
    marginBottom: 4,
  },
  optionLabelSelected: { color: '#fff' },
  optionDesc: { fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#17324D99' },
  optionDescSelected: { color: '#ffffff99' },
  button: {
    height: 48,
    backgroundColor: '#C4623B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: 'IBM Plex Mono', fontSize: 14, fontWeight: '600', color: '#fff' },
  buttonSecondary: {
    height: 48,
    borderWidth: 1,
    borderColor: '#17324D',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonSecondaryText: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 14,
    fontWeight: '600',
    color: '#17324D',
  },
  row: { flexDirection: 'row', marginTop: 8 },
});
