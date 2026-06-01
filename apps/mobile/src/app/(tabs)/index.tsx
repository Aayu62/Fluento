import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>COMMUNICATION TRAINING</Text>
      <Text style={styles.title}>Fluento</Text>
      <Text style={styles.subtitle}>Practice Real Conversations.{'\n'}Build Real Confidence.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  label: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#17324D',
    opacity: 0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#17324D',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'IBM Plex Mono',
    fontSize: 16,
    color: '#17324D',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 26,
  },
});
