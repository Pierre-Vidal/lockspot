import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone, type NomIcone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices, teintes } from '@/constants/theme';
import type { ElementCoffre } from '@/types/contenu';

export type ActionElement = 'renommer' | 'supprimer';

const ACTIONS: { action: ActionElement; libelle: string; icone: NomIcone; teinte: keyof typeof teintes }[] = [
    { action: 'renommer', libelle: 'Renommer', icone: 'crayon', teinte: 'vert' },
    { action: 'supprimer', libelle: 'Supprimer', icone: 'corbeille', teinte: 'rouge' },
];

type Props = {
    element: ElementCoffre | null;
    onChoisir: (action: ActionElement, element: ElementCoffre) => void;
    onFermer: () => void;
};

export function MenuElement({ element, onChoisir, onFermer }: Props) {
    const marges = useSafeAreaInsets();

    useEffect(() => {
        if (!element) return;
        const abonnement = BackHandler.addEventListener('hardwareBackPress', () => {
            onFermer();
            return true;
        });
        return () => abonnement.remove();
    }, [element, onFermer]);

    if (!element) return null;

    return (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={styles.calque}>
            <Pressable style={styles.voile} onPress={onFermer} accessibilityLabel="Fermer le menu" />

            <Animated.View
                entering={SlideInDown.duration(220)}
                style={[styles.feuille, { paddingBottom: marges.bottom + espacements.md }]}>
                <Text style={styles.titre} numberOfLines={1}>
                    {element.nom}
                </Text>
                {ACTIONS.map(({ action, libelle, icone, teinte }) => (
                    <Pressable
                        key={action}
                        onPress={() => onChoisir(action, element)}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.option, pressed && styles.optionAppuyee]}>
                        <View style={[styles.icone, { backgroundColor: teintes[teinte].fond }]}>
                            <Icone nom={icone} couleur={teintes[teinte].trait} taille={18} />
                        </View>
                        <Text style={[styles.libelle, action === 'supprimer' && { color: teintes.rouge.trait }]}>
                            {libelle}
                        </Text>
                    </Pressable>
                ))}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    calque: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'flex-end' },
    voile: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(28, 41, 38, 0.35)' },
    feuille: {
        gap: espacements.xs,
        paddingTop: espacements.lg,
        paddingHorizontal: espacements.lg,
        borderTopLeftRadius: arrondis.lg,
        borderTopRightRadius: arrondis.lg,
        backgroundColor: couleurs.surface,
    },
    titre: { fontFamily: polices.gras, fontSize: 15, color: couleurs.texte, marginBottom: espacements.sm },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.md,
        paddingVertical: espacements.sm,
        borderRadius: arrondis.sm,
    },
    optionAppuyee: { opacity: 0.6 },
    icone: {
        width: 36,
        height: 36,
        borderRadius: arrondis.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    libelle: { fontFamily: polices.gras, fontSize: 14, color: couleurs.texte },
});