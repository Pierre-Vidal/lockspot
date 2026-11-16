import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { useAuth } from '@/hooks/use-auth';
import { describeAuthError } from '@/services/auth-errors';

/**
 * Boutons provisoires pour tester l'authentification avant d'avoir l'écran Compte :
 * se déconnecter, et (en développement uniquement) supprimer le compte de test.
 */
export function AccountActions() {
  const { signOut, deleteAccount } = useAuth();

  function confirmDelete() {
    Alert.alert(
      'Supprimer ce compte ?',
      'Le compte sera supprimé définitivement de Firebase. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error) {
              Alert.alert('Suppression impossible', describeAuthError(error).message);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.actions}>
      <Pressable
        onPress={signOut}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, styles.signOut, pressed && styles.pressed]}>
        <Text style={styles.signOutLabel}>Se déconnecter</Text>
      </Pressable>
      {__DEV__ ? (
        <Pressable
          onPress={confirmDelete}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.delete, pressed && styles.pressed]}>
          <Text style={styles.deleteLabel}>Supprimer mon compte (test)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignSelf: 'stretch',
    gap: 10,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: Brand.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  signOut: {
    backgroundColor: Brand.colors.action,
    borderColor: Brand.colors.action,
  },
  signOutLabel: {
    fontFamily: Brand.fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  delete: {
    backgroundColor: Brand.colors.dangerSoft,
    borderColor: 'rgba(190, 75, 80, 0.3)',
  },
  deleteLabel: {
    fontFamily: Brand.fonts.bold,
    fontSize: 14,
    color: Brand.colors.danger,
  },
});
