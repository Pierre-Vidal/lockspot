import { StyleSheet, Text, View } from 'react-native';

import { ActionsCompte } from '@/components/auth/account-actions';
import { couleurs, espacements, typographie } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function EcranCompte() {
    const { user } = useAuth();

    return (
        <View style={styles.conteneur}>
            <Text style={styles.titre}>Compte</Text>
            <Text style={styles.connecte}>Connecté : {user?.displayName ?? user?.email}</Text>
            <ActionsCompte />
        </View>
    );
}

const styles = StyleSheet.create({
    conteneur: { flex: 1, justifyContent: 'center', gap: espacements.md, padding: espacements.lg, backgroundColor: couleurs.fond },
    titre: { ...typographie.titre, color: couleurs.texte },
    connecte: { ...typographie.corps, color: couleurs.texteSecondaire },
});
