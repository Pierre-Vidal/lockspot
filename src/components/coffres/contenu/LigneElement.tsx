import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone, type NomIcone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices, teintes } from '@/constants/theme';
import type { ElementCoffre } from '@/types/contenu';
import { formaterDate, formaterDateRelative, formaterTaille } from '@/utils/formatage';

const APPARENCE: Record<ElementCoffre['type'], { icone: NomIcone; teinte: keyof typeof teintes }> = {
    dossier: { icone: 'dossier', teinte: 'vert' },
    fichier: { icone: 'document', teinte: 'rouge' },
    note: { icone: 'note', teinte: 'jaune' },
    image: { icone: 'image', teinte: 'violet' },
};

function sousTitre(element: ElementCoffre): string {
    switch (element.type) {
        case 'dossier':
            return `Modifié ${formaterDateRelative(element.modifieLe)}`;
        case 'note':
            return `Note · ${formaterDate(element.modifieLe)}`;
        default:
            return `${formaterTaille(element.tailleOctets)} · ${formaterDate(element.creeLe)}`;
    }
}

type Props = {
    element: ElementCoffre;
    onPress?: () => void;
    onLongPress?: () => void;
};

export function LigneElement({ element, onPress, onLongPress }: Props) {
    const { icone, teinte } = APPARENCE[element.type];

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityLabel={`${element.nom}, ${sousTitre(element)}`}
            style={({ pressed }) => [styles.ligne, pressed && styles.appuyee]}>
            <View style={[styles.icone, { backgroundColor: teintes[teinte].fond }]}>
                <Icone nom={icone} couleur={teintes[teinte].trait} taille={20} />
            </View>
            <View style={styles.textes}>
                <Text style={styles.nom} numberOfLines={1}>
                    {element.nom}
                </Text>
                <Text style={styles.sousTitre} numberOfLines={1}>
                    {sousTitre(element)}
                </Text>
            </View>
            {element.type === 'dossier' && <Icone nom="chevronDroite" couleur={couleurs.texte} taille={14} />}
        </Pressable>
    );
}

const TAILLE_ICONE = 44;

const styles = StyleSheet.create({
    ligne: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.md,
        padding: espacements.sm + 4,
        borderRadius: arrondis.md,
        backgroundColor: couleurs.surface,
    },
    appuyee: { opacity: 0.8 },
    icone: {
        width: TAILLE_ICONE,
        height: TAILLE_ICONE,
        borderRadius: arrondis.sm + 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textes: { flex: 1, gap: 2 },
    nom: { fontFamily: polices.gras, fontSize: 14, color: couleurs.texte },
    sousTitre: { fontFamily: polices.corps, fontSize: 11, color: couleurs.texteDiscret },
});
