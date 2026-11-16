import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';

/** Message d'erreur général d'un formulaire (réseau, configuration, erreur inattendue…). */
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
    borderRadius: Brand.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(190, 75, 80, 0.3)',
    backgroundColor: Brand.colors.dangerSoft,
  },
  text: {
    fontFamily: Brand.fonts.semibold,
    fontSize: 12,
    lineHeight: 17,
    color: Brand.colors.danger,
  },
});
