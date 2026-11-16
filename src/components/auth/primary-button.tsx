import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Brand } from '@/constants/brand';

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
    borderRadius: Brand.radius.sm,
    backgroundColor: Brand.colors.action,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Brand.colors.action,
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
    fontFamily: Brand.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  arrow: {
    fontFamily: Brand.fonts.bold,
    fontSize: 20,
    lineHeight: 22,
    color: '#ffffff',
  },
});
