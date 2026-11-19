import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone } from '@/components/Icone';
import { couleurs, espacements, polices } from '@/constants/theme';
import { lireEnBase64 } from '@/services/contenuCoffres';
import type { FichierCoffre } from '@/types/contenu';

type Props = {
    idCoffre: string;
    image: FichierCoffre | null;
    onFermer: () => void;
};

export function VisionneuseImage({ idCoffre, image, onFermer }: Props) {
    const marges = useSafeAreaInsets();
    const [resultat, setResultat] = useState<{ idImage: string; source: string | null } | null>(null);

    useEffect(() => {
        if (!image) return;
        let actif = true;
        lireEnBase64(idCoffre, image.id)
            .then((base64) => {
                if (actif) setResultat({ idImage: image.id, source: `data:${image.typeMime};base64,${base64}` });
            })
            .catch(() => {
                if (actif) setResultat({ idImage: image.id, source: null });
            });
        return () => {
            actif = false;
        };
    }, [idCoffre, image]);

    const charge = resultat !== null && resultat.idImage === image?.id;

    return (
        <Modal visible={image !== null} animationType="fade" onRequestClose={onFermer} statusBarTranslucent>
            <View style={[styles.ecran, { paddingTop: marges.top, paddingBottom: marges.bottom }]}>
                <View style={styles.entete}>
                    <Text style={styles.nom} numberOfLines={1}>
                        {image?.nom}
                    </Text>
                    <Pressable onPress={onFermer} accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={12}>
                        <Icone nom="effacer" couleur={couleurs.texteSurSombre} taille={24} />
                    </Pressable>
                </View>

                <View style={styles.zone}>
                    {!charge ? (
                        <ActivityIndicator size="large" color={couleurs.texteSurSombre} />
                    ) : resultat.source ? (
                        <Image source={{ uri: resultat.source }} style={styles.image} contentFit="contain" cachePolicy="none" />
                    ) : (
                        <Text style={styles.message}>Impossible d’ouvrir cette image.</Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    ecran: { flex: 1, backgroundColor: '#000' },
    entete: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.md,
        paddingHorizontal: espacements.lg,
        paddingVertical: espacements.md,
    },
    nom: { flex: 1, fontFamily: polices.gras, fontSize: 15, color: couleurs.texteSurSombre },
    zone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    image: { width: '100%', height: '100%' },
    message: { fontFamily: polices.corps, fontSize: 14, color: couleurs.texteSurSombre },
});