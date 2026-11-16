import { StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, typographie } from '@/constants/theme';

export default function EcranCompte() {
    return (
        <View style={styles.conteneur}>
            <Text style={styles.titre}>Coffres</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    conteneur: { flex: 1, justifyContent: 'center', padding: espacements.lg, backgroundColor: couleurs.fond },
    titre: { ...typographie.titre, color: couleurs.texte },
});