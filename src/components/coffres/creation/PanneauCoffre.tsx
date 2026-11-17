import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ErrorBanner } from '@/components/auth/error-banner';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { Icone } from '@/components/Icone';
import { NOM_COFFRE_LONGUEUR_MAX } from '@/constants/coffres';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';

type Props = {
    /** Création : assistant en 2 étapes. Modification : nom et adresse visibles tout de suite. */
    mode: 'creation' | 'modification';
    /** Étape en cours (création uniquement). */
    etape: 1 | 2;
    nom: string;
    onChangeNom: (nom: string) => void;
    erreurNom: string | null;
    adresse: string | null;
    chargementAdresse: boolean;
    erreurEnvoi: string | null;
    envoiEnCours: boolean;
    onValider: () => void;
    margeBas: number;
};

export function PanneauCoffre({
                                  mode,
                                  etape,
                                  nom,
                                  onChangeNom,
                                  erreurNom,
                                  adresse,
                                  chargementAdresse,
                                  erreurEnvoi,
                                  envoiEnCours,
                                  onValider,
                                  margeBas,
                              }: Props) {
    const modification = mode === 'modification';
    const formulaireVisible = modification || etape === 2;

    return (
        <View style={[styles.panneau, { paddingBottom: margeBas }]}>
            <View style={styles.poignee} />

            <View style={styles.entete}>
                <View style={styles.titres}>
                    <Text style={styles.surtitre}>{modification ? 'MODIFIER LE COFFRE' : 'NOUVEAU COFFRE'}</Text>
                    <Text style={styles.titre}>
                        {modification ? 'Modifiez ce coffre' : etape === 1 ? 'Choisissez un lieu' : 'Nommez ce lieu'}
                    </Text>
                </View>
                {modification ? null : (
                    <View style={styles.badgeEtape}>
                        <Text style={styles.texteEtape}>Étape {etape}/2</Text>
                    </View>
                )}
            </View>

            {formulaireVisible ? (
                <>
                    <TextField
                        label="Nom du coffre"
                        value={nom}
                        onChangeText={onChangeNom}
                        error={erreurNom ?? undefined}
                        placeholder="Maison, Bureau…"
                        maxLength={NOM_COFFRE_LONGUEUR_MAX}
                        autoCapitalize="sentences"
                        returnKeyType="done"
                        onSubmitEditing={onValider}
                    />

                    <View style={styles.adresse}>
                        <Icone nom="lieu" couleur={couleurs.principaleFoncee} taille={20} />
                        <View style={styles.textesAdresse}>
                            <Text style={styles.libelleAdresse}>Adresse sélectionnée</Text>
                            {chargementAdresse || !adresse ? (
                                <ActivityIndicator size="small" color={couleurs.principale} style={styles.chargementAdresse} />
                            ) : (
                                <Text style={styles.valeurAdresse} numberOfLines={2}>
                                    {adresse}
                                </Text>
                            )}
                        </View>
                    </View>

                    {modification ? (
                        <Text style={styles.aide}>
                            Pour déplacer le coffre, recherchez une adresse, touchez la carte ou utilisez votre position actuelle.
                        </Text>
                    ) : null}

                    {erreurEnvoi ? <ErrorBanner message={erreurEnvoi} /> : null}

                    <PrimaryButton
                        label={modification ? 'Enregistrer les modifications' : 'Créer le coffre'}
                        onPress={onValider}
                        loading={envoiEnCours}
                    />
                </>
            ) : (
                <Text style={styles.consigne}>
                    Recherchez une adresse, touchez la carte ou utilisez votre position actuelle.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    panneau: {
        gap: espacements.md,
        paddingHorizontal: espacements.lg,
        paddingTop: espacements.sm + 2,
        marginTop: -arrondis.lg,
        borderTopLeftRadius: arrondis.lg,
        borderTopRightRadius: arrondis.lg,
        backgroundColor: couleurs.fond,
        boxShadow: '0 -6px 20px rgba(28, 41, 38, 0.08)',
    },
    poignee: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: couleurs.bordure,
    },
    entete: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: espacements.sm },
    titres: { flex: 1, gap: 2 },
    surtitre: { fontFamily: polices.gras, fontSize: 11, letterSpacing: 1.5, color: couleurs.principaleFoncee },
    titre: { fontFamily: polices.titre, fontSize: 24, color: couleurs.texte },
    badgeEtape: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 4,
        borderRadius: arrondis.pilule,
        backgroundColor: couleurs.principaleLegere,
    },
    texteEtape: { fontFamily: polices.gras, fontSize: 11, color: couleurs.principaleFoncee },
    consigne: { fontFamily: polices.corps, fontSize: 14, lineHeight: 20, color: couleurs.texteSecondaire },
    aide: { fontFamily: polices.corps, fontSize: 12, lineHeight: 17, color: couleurs.texteDiscret },
    adresse: { flexDirection: 'row', alignItems: 'center', gap: espacements.sm + 4, paddingHorizontal: 2 },
    textesAdresse: { flex: 1, gap: 2 },
    libelleAdresse: { fontFamily: polices.corps, fontSize: 11, color: couleurs.texteDiscret },
    valeurAdresse: { fontFamily: polices.gras, fontSize: 13, color: couleurs.texte },
    chargementAdresse: { alignSelf: 'flex-start' },
});
