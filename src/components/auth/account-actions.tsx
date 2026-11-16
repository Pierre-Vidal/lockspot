import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { arrondis, couleurs, polices } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { describeAuthError } from '@/services/auth-errors';

/**
 * Boutons provisoires pour tester l'authentification avant d'avoir l'écran Compte :
 * se déconnecter, et (en développement uniquement) supprimer le compte de test.
 */
export function ActionsCompte() {
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
    borderRadius: arrondis.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  signOut: {
    backgroundColor: couleurs.principale,
    borderColor: couleurs.principale,
  },
  signOutLabel: {
    fontFamily: polices.gras,
    fontSize: 15,
    color: '#ffffff',
  },
  delete: {
    backgroundColor: couleurs.erreurLegere,
    borderColor: 'rgba(190, 75, 80, 0.3)',
  },
  deleteLabel: {
    fontFamily: polices.gras,
    fontSize: 14,
    color: couleurs.erreur,
  },
});
