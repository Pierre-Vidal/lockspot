import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Icone, type NomIcone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices, teintes } from '@/constants/theme';

export type ActionAjout = 'dossier' | 'fichier';

const ACTIONS: { action: ActionAjout; libelle: string; icone: NomIcone }[] = [
    { action: 'dossier', libelle: 'Nouveau dossier', icone: 'dossier' },
    { action: 'fichier', libelle: 'Importer un fichier', icone: 'document' },
];

export const TAILLE_BOUTON_AJOUT = 60;

type Props = {
    visible: boolean;
    basBouton: number;
    onChoisir: (action: ActionAjout) => void;
    onFermer: () => void;
};

export function MenuAjout({ visible, basBouton, onChoisir, onFermer }: Props) {
    useEffect(() => {
        if (!visible) return;
        const abonnement = BackHandler.addEventListener('hardwareBackPress', () => {
            onFermer();
            return true;
        });
        return () => abonnement.remove();
    }, [visible, onFermer]);

    if (!visible) return null;

    return (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={styles.calque}>
            <Pressable style={styles.voile} onPress={onFermer} accessibilityLabel="Fermer le menu" />

            <Animated.View
                entering={FadeInDown.duration(180)}
                style={[styles.menu, { bottom: basBouton + TAILLE_BOUTON_AJOUT + espacements.md }]}>
                <Text style={styles.titre}>AJOUTER AU COFFRE</Text>
                {ACTIONS.map(({ action, libelle, icone }) => (
                    <Pressable
                        key={action}
                        onPress={() => onChoisir(action)}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.option, pressed && styles.optionAppuyee]}>
                        <View style={styles.icone}>
                            <Icone nom={icone} couleur={teintes.vert.trait} taille={18} />
                        </View>
                        <Text style={styles.libelle}>{libelle}</Text>
                    </Pressable>
                ))}
            </Animated.View>

            <View style={[styles.emplacementBouton, { bottom: basBouton }]}>
                <Pressable
                    onPress={onFermer}
                    accessibilityRole="button"
                    accessibilityLabel="Fermer le menu"
                    style={({ pressed }) => [styles.bouton, pressed && styles.boutonAppuye]}>
                    <Icone nom="effacer" couleur={couleurs.surface} taille={24} />
                </Pressable>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    calque: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    // Voile clair à la place d'un vrai flou : expo-blur n'est pas dans le build de dev.
    voile: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(238, 230, 219, 0.82)' },
    menu: {
        position: 'absolute',
        right: espacements.lg,
        gap: espacements.xs,
        paddingVertical: espacements.md,
        paddingHorizontal: espacements.md,
        borderRadius: arrondis.lg,
        backgroundColor: couleurs.surface,
        boxShadow: '0 10px 30px rgba(28, 41, 38, 0.15)',
    },
    titre: {
        fontFamily: polices.gras,
        fontSize: 10,
        letterSpacing: 1.2,
        color: couleurs.texteSecondaire,
        marginBottom: espacements.xs,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.sm + 4,
        paddingVertical: espacements.xs + 2,
        paddingRight: espacements.lg,
        borderRadius: arrondis.sm,
    },
    optionAppuyee: { opacity: 0.6 },
    icone: {
        width: 34,
        height: 34,
        borderRadius: arrondis.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: teintes.vert.fond,
    },
    libelle: { fontFamily: polices.gras, fontSize: 13, color: couleurs.texte },
    emplacementBouton: { position: 'absolute', right: espacements.lg },
    bouton: {
        width: TAILLE_BOUTON_AJOUT,
        height: TAILLE_BOUTON_AJOUT,
        borderRadius: TAILLE_BOUTON_AJOUT / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: couleurs.principale,
        boxShadow: '0 8px 20px rgba(0, 179, 139, 0.4)',
    },
    boutonAppuye: { transform: [{ scale: 0.94 }] },
});