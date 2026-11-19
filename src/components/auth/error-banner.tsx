import { StyleSheet, Text, View } from 'react-native';

import { arrondis, couleurs, polices } from '@/constants/theme';

// Erreur générale d'un formulaire (réseau, erreur inattendue…)
export function ErrorBanner({ message }: Readonly<{ message: string }>) {
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: arrondis.md,
    borderWidth: 1,
    borderColor: 'rgba(190, 75, 80, 0.3)',
    backgroundColor: couleurs.erreurLegere,
  },
  text: {
    fontFamily: polices.semiGras,
    fontSize: 12,
    lineHeight: 17,
    color: couleurs.erreur,
  },
});
