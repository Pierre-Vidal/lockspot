import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { arrondis, couleurs, polices } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, loading = false }: Readonly<PrimaryButtonProps>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, loading && styles.loading]}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.arrow}>→</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: arrondis.md,
    backgroundColor: couleurs.principale,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: couleurs.principale,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 6,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  loading: {
    opacity: 0.8,
  },
  label: {
    fontFamily: polices.gras,
    fontSize: 16,
    color: '#ffffff',
  },
  arrow: {
    fontFamily: polices.gras,
    fontSize: 20,
    lineHeight: 22,
    color: '#ffffff',
  },
});
