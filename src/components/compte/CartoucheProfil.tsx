import { StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, polices } from '@/constants/theme';
import { initiales } from '@/utils/initiales';

import { AvatarInitiales } from './AvatarInitiales';

type Props = {
    nomUtilisateur: string | null;
    email: string | null;
};

// Bloc sombre en haut de la page : avatar, pseudo et e-mail
export function CartoucheProfil({ nomUtilisateur, email }: Props) {
    const nom = nomUtilisateur ?? email?.split('@')[0] ?? 'Mon compte';

    return (
        <View style={styles.cartouche}>
            <AvatarInitiales initiales={initiales(nomUtilisateur, email)} />
            <View style={styles.textes}>
                <Text style={styles.nom} numberOfLines={1}>
                    {nom}
                </Text>
                {email ? (
                    <Text style={styles.email} numberOfLines={1}>
                        {email}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cartouche: {
        minHeight: 104,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: espacements.md,
        borderRadius: 22,
        backgroundColor: couleurs.texte,
        boxShadow: '0 4px 14px rgba(35, 48, 44, 0.08)',
    },
    textes: { flex: 1, gap: 4 },
    nom: { fontFamily: polices.titre, fontSize: 19, color: '#FFFFFF' },
    email: { fontFamily: polices.corps, fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' },
});
