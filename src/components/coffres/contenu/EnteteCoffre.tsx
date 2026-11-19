import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';
import type { Dossier } from '@/types/contenu';

type Props = {
    nomCoffre: string;
    chemin: Dossier[];
    onRetour: () => void;
    onVerrouiller: () => void;
    onAllerA: (dossierId: string | null) => void;
};

export function EnteteCoffre({ nomCoffre, chemin, onRetour, onVerrouiller, onAllerA }: Props) {
    const marges = useSafeAreaInsets();
    const etapes = [{ id: null, nom: nomCoffre }, ...chemin.map(({ id, nom }) => ({ id, nom }))];

    return (
        <View style={[styles.entete, { paddingTop: marges.top + espacements.sm }]}>
            <View style={styles.barre}>
                <Pressable onPress={onRetour} accessibilityRole="button" accessibilityLabel="Retour" hitSlop={8} style={styles.boutonRond}>
                    <Icone nom="retour" couleur={couleurs.texteSurSombre} taille={18} />
                </Pressable>
                <View style={styles.cadenas}>
                    <Icone nom="cadenasOuvert" couleur={couleurs.principale} taille={18} />
                </View>
                <Pressable onPress={onVerrouiller} accessibilityRole="button" style={styles.boutonVerrouiller}>
                    <Text style={styles.texteVerrouiller}>Verrouiller</Text>
                </Pressable>
            </View>

            <Text style={styles.surtitre}>COFFRE DÉVERROUILLÉ</Text>
            <Text style={styles.titre} numberOfLines={1}>
                {nomCoffre}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fil}>
                {etapes.map((etape, index) => {
                    const derniere = index === etapes.length - 1;
                    return (
                        <Fragment key={etape.id ?? 'racine'}>
                            {index > 0 && <Icone nom="chevronDroite" couleur={couleurs.texteDiscret} taille={10} />}
                            <Pressable
                                onPress={() => onAllerA(etape.id)}
                                disabled={derniere}
                                accessibilityRole="link"
                                hitSlop={6}>
                                <Text style={[styles.etape, derniere && styles.etapeCourante]}>{etape.nom}</Text>
                            </Pressable>
                        </Fragment>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    entete: {
        gap: espacements.xs,
        paddingHorizontal: espacements.lg,
        paddingBottom: arrondis.lg + espacements.lg,
        backgroundColor: couleurs.enteteSombre,
        experimental_backgroundImage: `linear-gradient(200deg, ${couleurs.enteteLueur} 0%, ${couleurs.enteteSombre} 55%)`,
    },
    barre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: espacements.md },
    boutonRond: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    cadenas: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 179, 139, 0.18)',
    },
    boutonVerrouiller: {
        paddingHorizontal: espacements.md,
        paddingVertical: espacements.sm,
        borderRadius: arrondis.pilule,
        borderWidth: 1,
        borderColor: 'rgba(244, 241, 236, 0.25)',
        backgroundColor: 'rgba(244, 241, 236, 0.08)',
    },
    texteVerrouiller: { fontFamily: polices.gras, fontSize: 12, color: couleurs.texteSurSombre },
    surtitre: { fontFamily: polices.gras, fontSize: 11, letterSpacing: 1.5, color: couleurs.principale },
    titre: { fontFamily: polices.titre, fontSize: 30, color: couleurs.texteSurSombre },
    fil: { alignItems: 'center', gap: espacements.sm, marginTop: espacements.sm },
    etape: { fontFamily: polices.moyen, fontSize: 12, color: couleurs.texteDiscret },
    etapeCourante: { fontFamily: polices.gras, color: couleurs.texteSurSombre },
});
