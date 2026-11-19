import { StyleSheet, Text, View } from 'react-native';

import { couleurs, polices } from '@/constants/theme';

type Props = {
    titre: string;
    // Petite pastille avec un nombre (ex. le nombre de coffres)
    nombre?: number;
};

export function TitreSection({ titre, nombre }: Props) {
    return (
        <View style={styles.ligne} accessibilityRole="header">
            <Text style={styles.titre}>{titre}</Text>
            {nombre !== undefined ? (
                <View style={styles.pastille}>
                    <Text style={styles.nombre}>{nombre}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    ligne: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 10, marginHorizontal: 2 },
    titre: { fontFamily: polices.gras, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: couleurs.texte },
    pastille: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principaleLegere,
    },
    nombre: { fontFamily: polices.gras, fontSize: 11, color: couleurs.principaleFoncee },
});
