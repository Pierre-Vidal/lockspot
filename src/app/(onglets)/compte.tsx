import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/auth/error-banner';
import { Icone } from '@/components/Icone';
import { CartoucheProfil } from '@/components/compte/CartoucheProfil';
import { LigneCoffre } from '@/components/compte/LigneCoffre';
import { LigneReglage } from '@/components/compte/LigneReglage';
import { TitreSection } from '@/components/compte/TitreSection';
import { RAYON_ZONE_METRES } from '@/constants/coffres';
import { couleurs, espacements, polices } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useCoffres } from '@/hooks/useCoffres';
import { useNotifications } from '@/hooks/useNotifications';
import { usePositionRecente } from '@/hooks/usePositionRecente';
import { describeAuthError } from '@/services/auth-errors';
import { supprimerCoffre, supprimerTousLesCoffres } from '@/services/coffres';
import type { Coffre } from '@/types/coffre';
import { estDansZone } from '@/utils/geo';

export default function EcranCompte() {
    const router = useRouter();
    const { user, signOut, deleteAccount } = useAuth();
    const { coffres, chargement, erreur } = useCoffres();
    const position = usePositionRecente();
    const { actives: notifications, changer: changerNotifications } = useNotifications();
    // Évite un second appui pendant que le téléphone affiche ses fenêtres de permission.
    const [changementEnCours, setChangementEnCours] = useState(false);

    function proposerReglages(titre: string, message: string) {
        Alert.alert(titre, message, [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
        ]);
    }

    async function basculerNotifications(voulues: boolean) {
        if (changementEnCours) return;
        setChangementEnCours(true);
        try {
            const resultat = await changerNotifications(voulues);
            if (resultat === 'notifications-refusees') {
                proposerReglages(
                    'Notifications désactivées',
                    'Pour recevoir les alertes de proximité, autorisez les notifications de Lockspot dans les réglages du téléphone.',
                );
            } else if (resultat === 'position-arriere-plan-refusee') {
                proposerReglages(
                    'Position « tout le temps » conseillée',
                    'Sans elle, vous êtes prévenu seulement quand l’appli est ouverte. Pour l’être aussi appli fermée, choisissez « Toujours autoriser » pour la position de Lockspot dans les réglages.',
                );
            }
        } catch (erreurActivation) {
            Alert.alert('Réglage impossible', describeAuthError(erreurActivation).message);
        } finally {
            setChangementEnCours(false);
        }
    }

    function estAProximite(coffre: Coffre): boolean {
        return position !== null && estDansZone(position, coffre.coordonnees, RAYON_ZONE_METRES);
    }

    function confirmerSuppressionCoffre(coffre: Coffre) {
        Alert.alert(`Supprimer « ${coffre.nom} » ?`, 'Le coffre et son contenu seront supprimés. Cette action est irréversible.', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                // La liste se met à jour toute seule : Firestore prévient l'appli de la suppression.
                onPress: () => {
                    supprimerCoffre(coffre.id).catch((erreurSuppression) => {
                        Alert.alert('Suppression impossible', describeAuthError(erreurSuppression).message);
                    });
                },
            },
        ]);
    }

    async function seDeconnecter() {
        try {
            await signOut();
        } catch (erreur) {
            Alert.alert('Déconnexion impossible', describeAuthError(erreur).message);
        }
    }

    function confirmerSuppressionCompte() {
        Alert.alert('Supprimer votre compte ?', 'Votre compte et vos données seront supprimés définitivement. Cette action est irréversible.', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer définitivement',
                style: 'destructive',
                onPress: async () => {
                    try {
                        // Les coffres d'abord : une fois le compte supprimé, il serait trop tard.
                        if (user) await supprimerTousLesCoffres(user.uid);
                        await deleteAccount();
                    } catch (erreur) {
                        Alert.alert('Suppression impossible', describeAuthError(erreur).message);
                    }
                },
            },
        ]);
    }

    return (
        <SafeAreaView edges={['top']} style={styles.ecran}>
            <ScrollView contentContainerStyle={styles.contenu} showsVerticalScrollIndicator={false}>
                <View style={styles.entete}>
                    <Pressable
                        onPress={() => router.navigate('/')}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Retour à la carte"
                        style={styles.boutonRetour}>
                        <Icone nom="retour" couleur={couleurs.texte} taille={22} />
                    </Pressable>
                    <Text style={styles.titre} accessibilityRole="header">
                        Compte
                    </Text>
                    <View style={styles.boutonRetour} />
                </View>

                <CartoucheProfil nomUtilisateur={user?.displayName ?? null} email={user?.email ?? null} />

                <TitreSection titre="Mes coffres" nombre={chargement ? undefined : coffres.length} />
                {erreur ? <ErrorBanner message={erreur} /> : null}
                {chargement ? (
                    <ActivityIndicator color={couleurs.principale} style={styles.chargement} />
                ) : coffres.length > 0 ? (
                    <View style={styles.listeCoffres}>
                        {coffres.map((coffre) => (
                            <LigneCoffre
                                key={coffre.id}
                                coffre={coffre}
                                aProximite={estAProximite(coffre)}
                                onModifier={() => router.push({ pathname: '/modifier-coffre', params: { id: coffre.id } })}
                                onSupprimer={() => confirmerSuppressionCoffre(coffre)}
                            />
                        ))}
                    </View>
                ) : (
                    <Text style={styles.aucunCoffre}>Aucun coffre pour le moment. Créez-en un depuis l’onglet « Nouveau coffre ».</Text>
                )}

                <TitreSection titre="Réglages" />
                <View style={styles.carteReglages}>
                    <LigneReglage
                        icone="cloche"
                        libelle="Notifications"
                        onPress={() => basculerNotifications(!notifications)}
                        droite={
                            <Switch
                                value={notifications}
                                onValueChange={basculerNotifications}
                                disabled={changementEnCours}
                                trackColor={{ false: '#C9C5BE', true: couleurs.principale }}
                                thumbColor="#FFFFFF"
                            />
                        }
                    />
                    <LigneReglage
                        icone="reglages"
                        libelle="Sécurité et biométrie"
                        onPress={() => Alert.alert('Bientôt disponible', 'Les réglages de sécurité arrivent prochainement.')}
                        droite={<Icone nom="chevronDroite" couleur={couleurs.texteSecondaire} taille={18} />}
                    />
                    <LigneReglage icone="deconnexion" libelle="Se déconnecter" onPress={seDeconnecter} danger />
                    <LigneReglage
                        icone="suppressionCompte"
                        libelle="Supprimer mon compte"
                        onPress={confirmerSuppressionCompte}
                        danger
                        separateur={false}
                    />
                </View>

                <Text style={styles.version}>Lockspot · version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    ecran: { flex: 1, backgroundColor: couleurs.fond },
    contenu: { paddingHorizontal: 18, paddingBottom: espacements.lg },
    entete: { height: 74, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    boutonRetour: { width: 38, height: 38, alignItems: 'flex-start', justifyContent: 'center' },
    titre: { fontFamily: polices.titre, fontSize: 20, color: couleurs.texte },
    chargement: { marginVertical: espacements.md },
    listeCoffres: { gap: 8 },
    aucunCoffre: { fontFamily: polices.corps, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire, paddingHorizontal: 2 },
    carteReglages: { borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(255, 253, 249, 0.75)' },
    version: { marginTop: 18, textAlign: 'center', fontFamily: polices.corps, fontSize: 11, color: '#9C968D' },
});
