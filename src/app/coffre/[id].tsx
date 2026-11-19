import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { estDansAppExterne } from '@/services/appExterne';
import { effacerCopiesEnClair } from '@/services/ouverture';
import { ErrorBanner } from '@/components/auth/error-banner';
import { EnteteCoffre } from '@/components/coffres/contenu/EnteteCoffre';
import { LigneElement } from '@/components/coffres/contenu/LigneElement';
import { MenuAjout, TAILLE_BOUTON_AJOUT, type ActionAjout } from '@/components/coffres/contenu/MenuAjout';
import { MenuElement, type ActionElement } from '@/components/coffres/contenu/MenuElement';
import { ModaleNom } from '@/components/coffres/contenu/ModaleNom';
import { EcranChargement } from '@/components/EcranChargement';
import { Icone } from '@/components/Icone';
import { arrondis, couleurs, espacements, polices } from '@/constants/theme';
import { useCoffres } from '@/hooks/useCoffres';
import { useContenuCoffre } from '@/hooks/useContenuCoffre';
import { estOuvert, refermer, tempsRestant } from '@/services/sessionsCoffres';
import type { ElementCoffre, FichierCoffre, Tri } from '@/types/contenu';
import { cheminVers, contenuDuDossier } from '@/utils/arborescence';
import { VisionneuseImage } from '@/components/coffres/contenu/VisionneuseImage';

const LIBELLES_TRI: Record<Tri, string> = { recents: 'Récents', nom: 'Nom', type: 'Type' };
const TRI_SUIVANT: Record<Tri, Tri> = { recents: 'nom', nom: 'type', type: 'recents' };

export default function EcranCoffreOuvert() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const marges = useSafeAreaInsets();
    const { coffres, chargement: chargementCoffres } = useCoffres();
    const coffre = coffres.find((candidat) => candidat.id === id);
    const [autorise] = useState(() => estOuvert(id));

    const contenu = useContenuCoffre(id);
    const [dossierCourantId, setDossierCourantId] = useState<string | null>(null);
    const [tri, setTri] = useState<Tri>('recents');
    const [menuVisible, setMenuVisible] = useState(false);
    const [modaleDossierVisible, setModaleDossierVisible] = useState(false);
    const [imageOuverte, setImageOuverte] = useState<FichierCoffre | null>(null);
    const [elementMenu, setElementMenu] = useState<ElementCoffre | null>(null);
    const [elementARenommer, setElementARenommer] = useState<ElementCoffre | null>(null);

    const chemin = cheminVers(contenu.elements, dossierCourantId);
    const dossierCourant = chemin.at(-1) ?? null;
    const elementsAffiches = contenuDuDossier(contenu.elements, dossierCourantId, tri);

    const verrouiller = useCallback(() => {
        refermer(id);
        effacerCopiesEnClair();
        if (router.canGoBack()) router.back();
        else router.replace('/');
    }, [id]);

    const revenir = useCallback(() => {
        if (dossierCourant) setDossierCourantId(dossierCourant.parentId);
        else verrouiller();
    }, [dossierCourant, verrouiller]);

    useEffect(() => {
        if (!autorise) return;

        const minuteur = setTimeout(verrouiller, tempsRestant(id));

        const abonnement = AppState.addEventListener('change', (etat) => {
            if (etat === 'background' && !estDansAppExterne()) verrouiller();
        });

        return () => {
            clearTimeout(minuteur);
            abonnement.remove();
        };
    }, [autorise, id, verrouiller]);

    useEffect(() => {
        const abonnement = BackHandler.addEventListener('hardwareBackPress', () => {
            revenir();
            return true;
        });
        return () => abonnement.remove();
    }, [revenir]);

    function choisirAction(action: ActionAjout) {
        setMenuVisible(false);
        if (action === 'dossier') setModaleDossierVisible(true);
        else contenu.importerFichiers(dossierCourantId);
    }

    function ouvrir(element: ElementCoffre) {
        if (element.type === 'dossier') setDossierCourantId(element.id);
        else if (element.type === 'image') setImageOuverte(element);
        else if (element.type === 'fichier') contenu.ouvrirAilleurs(element);
    }

    async function creerDossier(nom: string) {
        setModaleDossierVisible(false);
        await contenu.creerDossier(nom, dossierCourantId);
    }

    function choisirActionElement(action: ActionElement, element: ElementCoffre) {
        setElementMenu(null);
        if (action === 'renommer') setElementARenommer(element);
        else confirmerSuppression(element);
    }

    async function renommer(nom: string) {
        const element = elementARenommer;
        setElementARenommer(null);
        if (element && nom !== element.nom) await contenu.renommer(element.id, nom);
    }

    function confirmerSuppression(element: ElementCoffre) {
        const message =
            element.type === 'dossier'
                ? 'Le dossier et tout ce qu’il contient seront supprimés définitivement.'
                : 'Cet élément sera supprimé définitivement.';
        Alert.alert(`Supprimer « ${element.nom} » ?`, message, [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: () => contenu.supprimer(element.id) },
        ]);
    }

    if (!autorise) return <Redirect href="/" />;

    if (chargementCoffres || !coffre) return <EcranChargement />;

    const nombre = elementsAffiches.length;
    const basBouton = marges.bottom + espacements.lg;

    return (
        <View style={styles.ecran}>
            <EnteteCoffre
                nomCoffre={coffre.nom}
                chemin={chemin}
                onRetour={revenir}
                onVerrouiller={verrouiller}
                onAllerA={setDossierCourantId}
            />

            <Animated.View entering={FadeInDown.duration(250)} style={styles.panneau}>
                <View style={styles.entetePanneau}>
                    <View style={styles.titres}>
                        <Text style={styles.surtitre}>
                            {nombre} ÉLÉMENT{nombre > 1 ? 'S' : ''}
                        </Text>
                        <Text style={styles.titre} numberOfLines={1}>
                            {dossierCourant?.nom ?? 'Contenu'}
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => setTri(TRI_SUIVANT[tri])}
                        accessibilityRole="button"
                        accessibilityLabel={`Trier par ${LIBELLES_TRI[tri]}`}
                        accessibilityHint="Touchez pour changer de tri"
                        style={styles.tri}>
                        <Text style={styles.texteTri}>{LIBELLES_TRI[tri]}</Text>
                        <Icone nom="chevronBas" couleur={couleurs.texte} taille={10} />
                    </Pressable>
                </View>

                {contenu.erreur && <ErrorBanner message={contenu.erreur} />}

                {contenu.chargement ? (
                    <ActivityIndicator style={styles.chargement} color={couleurs.principale} />
                ) : (
                    <FlatList
                        data={elementsAffiches}
                        keyExtractor={(element) => element.id}
                        renderItem={({ item }) => (
                            <LigneElement
                                element={item}
                                onPress={item.type === 'note' ? undefined : () => ouvrir(item)}
                                onLongPress={() => setElementMenu(item)}
                            />
                        )}
                        ItemSeparatorComponent={Separateur}
                        ListEmptyComponent={
                            <Animated.View entering={FadeIn} style={styles.vide}>
                                <Text style={styles.titreVide}>
                                    {dossierCourant ? 'Ce dossier est vide' : 'Ce coffre est vide'}
                                </Text>
                                <Text style={styles.texteVide}>Touchez + pour importer un fichier ou créer un dossier.</Text>
                            </Animated.View>
                        }
                        contentContainerStyle={{ paddingBottom: marges.bottom + 96 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </Animated.View>

            <Pressable
                onPress={() => setMenuVisible(true)}
                disabled={contenu.operationEnCours}
                accessibilityRole="button"
                accessibilityLabel="Ajouter au coffre"
                style={({ pressed }) => [styles.boutonAjout, { bottom: basBouton }, pressed && styles.boutonAppuye]}>
                {contenu.operationEnCours ? (
                    <ActivityIndicator color={couleurs.surface} />
                ) : (
                    <Icone nom="ajout" couleur={couleurs.surface} taille={26} />
                )}
            </Pressable>

            <MenuAjout
                visible={menuVisible}
                basBouton={basBouton}
                onChoisir={choisirAction}
                onFermer={() => setMenuVisible(false)}
            />
            <ModaleNom
                visible={modaleDossierVisible}
                titre="Nouveau dossier"
                libelleBouton="Créer le dossier"
                onValider={creerDossier}
                onFermer={() => setModaleDossierVisible(false)}
            />
            <MenuElement element={elementMenu} onChoisir={choisirActionElement} onFermer={() => setElementMenu(null)} />
            <ModaleNom
                visible={elementARenommer !== null}
                titre="Renommer"
                libelleBouton="Enregistrer"
                valeurInitiale={elementARenommer?.nom}
                onValider={renommer}
                onFermer={() => setElementARenommer(null)}
            />
            <VisionneuseImage
                idCoffre={id}
                image={imageOuverte}
                onFermer={() => setImageOuverte(null)} />
        </View>
    );
}

function Separateur() {
    return <View style={styles.separateur} />;
}

const styles = StyleSheet.create({
    ecran: { flex: 1, backgroundColor: couleurs.enteteSombre },
    panneau: {
        flex: 1,
        gap: espacements.md,
        marginTop: -arrondis.lg,
        paddingTop: espacements.lg,
        paddingHorizontal: espacements.md,
        borderTopLeftRadius: arrondis.lg,
        borderTopRightRadius: arrondis.lg,
        backgroundColor: couleurs.fond,
    },
    entetePanneau: { flexDirection: 'row', alignItems: 'flex-end', gap: espacements.sm, paddingHorizontal: espacements.sm },
    titres: { flex: 1, gap: 2 },
    surtitre: { fontFamily: polices.gras, fontSize: 11, letterSpacing: 1.5, color: couleurs.principaleFoncee },
    titre: { fontFamily: polices.titre, fontSize: 24, color: couleurs.texte },
    tri: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espacements.xs + 2,
        paddingHorizontal: espacements.sm + 4,
        paddingVertical: espacements.sm,
        borderRadius: arrondis.sm + 2,
        backgroundColor: couleurs.surface,
    },
    texteTri: { fontFamily: polices.gras, fontSize: 12, color: couleurs.texte },
    chargement: { marginTop: espacements.xl },
    separateur: { height: espacements.sm },
    vide: { alignItems: 'center', gap: espacements.xs, marginTop: espacements.xl, paddingHorizontal: espacements.lg },
    titreVide: { fontFamily: polices.gras, fontSize: 15, color: couleurs.texte },
    texteVide: { fontFamily: polices.corps, fontSize: 13, color: couleurs.texteSecondaire, textAlign: 'center' },
    boutonAjout: {
        position: 'absolute',
        right: espacements.lg,
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
