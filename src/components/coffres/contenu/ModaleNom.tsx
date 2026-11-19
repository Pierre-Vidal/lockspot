import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';

const LONGUEUR_MAX = 60;

type Props = {
    visible: boolean;
    titre: string;
    libelleBouton: string;
    valeurInitiale?: string;
    onValider: (nom: string) => void;
    onFermer: () => void;
};

export function ModaleNom({ visible, titre, libelleBouton, valeurInitiale = '', onValider, onFermer }: Props) {
    const [nom, setNom] = useState(valeurInitiale);
    const [erreur, setErreur] = useState<string | undefined>();

    function valider() {
        const nomNettoye = nom.trim();
        if (!nomNettoye) {
            setErreur('Donnez un nom.');
            return;
        }
        onValider(nomNettoye);
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onFermer}
            onShow={() => {
                setNom(valeurInitiale);
                setErreur(undefined);
            }}
            statusBarTranslucent>
            <KeyboardAvoidingView behavior="padding" style={styles.voile}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onFermer} accessibilityLabel="Fermer" />
                <View style={styles.boite}>
                    <Text style={styles.titre}>{titre}</Text>
                    <TextField
                        label="Nom"
                        value={nom}
                        onChangeText={(texte) => {
                            setNom(texte);
                            setErreur(undefined);
                        }}
                        error={erreur}
                        autoFocus
                        maxLength={LONGUEUR_MAX}
                        returnKeyType="done"
                        onSubmitEditing={valider}
                    />
                    <PrimaryButton label={libelleBouton} onPress={valider} />
                    <Pressable onPress={onFermer} accessibilityRole="button" style={styles.annuler}>
                        <Text style={styles.texteAnnuler}>Annuler</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    voile: { flex: 1, justifyContent: 'center', padding: espacements.lg, backgroundColor: 'rgba(28, 41, 38, 0.35)' },
    boite: { gap: espacements.md, padding: espacements.lg, borderRadius: arrondis.lg, backgroundColor: couleurs.fond },
    titre: { fontFamily: polices.titre, fontSize: 20, color: couleurs.texte },
    annuler: { alignSelf: 'center', padding: espacements.sm },
    texteAnnuler: { fontFamily: polices.semiGras, fontSize: 14, color: couleurs.texteSecondaire },
});
