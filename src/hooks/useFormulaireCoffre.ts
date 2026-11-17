import NetInfo from '@react-native-community/netinfo';
import { useRef, useState } from 'react';

import { NOM_COFFRE_LONGUEUR_MAX } from '@/constants/coffres';
import { useAuth } from '@/hooks/use-auth';
import { creerCoffre, modifierCoffre } from '@/services/coffres';
import { adresseDepuisCoordonnees, type SuggestionAdresse } from '@/services/geocodage';
import type { Coffre, Coordonnees } from '@/types/coffre';

export type LieuChoisi = {
    coordonnees: Coordonnees;
    adresse: string | null;
};

function coordonneesEnTexte({ latitude, longitude }: Coordonnees): string {
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function validerNom(nom: string): string | null {
    const nomNettoye = nom.trim();
    if (nomNettoye.length === 0) return 'Donnez un nom à votre coffre.';
    if (nomNettoye.length > NOM_COFFRE_LONGUEUR_MAX) return `${NOM_COFFRE_LONGUEUR_MAX} caractères maximum.`;
    return null;
}

/**
 * État du formulaire d'un coffre, pour la création comme pour la modification.
 * Sans argument : formulaire vide (création). Avec un coffre : nom et lieu pré-remplis,
 * et `enregistrer` met ce coffre à jour au lieu d'en créer un nouveau.
 * Les valeurs de départ ne sont lues qu'une fois : les mises à jour de Firestore pendant
 * la saisie n'écrasent donc pas ce que l'utilisateur tape.
 */
export function useFormulaireCoffre(coffre?: Coffre) {
    const { user } = useAuth();
    const [lieu, setLieu] = useState<LieuChoisi | null>(
        coffre ? { coordonnees: coffre.coordonnees, adresse: coffre.adresse } : null,
    );
    const [chargementAdresse, setChargementAdresse] = useState(false);
    const [nom, setNom] = useState(coffre?.nom ?? '');
    const [erreurNom, setErreurNom] = useState<string | null>(null);
    const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
    const [envoiEnCours, setEnvoiEnCours] = useState(false);
    const derniereDemande = useRef(0);

    function choisirSuggestion(suggestion: SuggestionAdresse) {
        derniereDemande.current += 1;
        setChargementAdresse(false);
        setLieu({ coordonnees: suggestion.coordonnees, adresse: suggestion.adresse });
    }

    async function choisirCoordonnees(coordonnees: Coordonnees) {
        const demande = ++derniereDemande.current;
        setLieu({ coordonnees, adresse: null });
        setChargementAdresse(true);

        let adresse: string | null = null;
        try {
            adresse = await adresseDepuisCoordonnees(coordonnees);
        } catch {
            // Pas de réseau ou erreur Mapbox : affichage des coordonnées à la place
        }

        if (demande !== derniereDemande.current) return;
        setLieu({ coordonnees, adresse: adresse ?? coordonneesEnTexte(coordonnees) });
        setChargementAdresse(false);
    }

    function modifierNom(valeur: string) {
        setNom(valeur);
        if (erreurNom) setErreurNom(null);
    }

    /** Crée le coffre, ou met à jour celui passé au hook. Renvoie `true` si c'est parti. */
    async function enregistrer(): Promise<boolean> {
        const erreur = validerNom(nom);
        setErreurNom(erreur);
        setErreurEnvoi(null);
        if (erreur || !lieu || !user) return false;

        setEnvoiEnCours(true);
        // En ligne, on attend le serveur pour pouvoir afficher une erreur
        // Hors ligne, Firestore envoie le coffre plus tard : inutile de bloquer l'écran
        try {
            const donnees = {
                nom,
                adresse: lieu.adresse ?? coordonneesEnTexte(lieu.coordonnees),
                coordonnees: lieu.coordonnees,
            };
            const envoi = coffre ? modifierCoffre(coffre.id, donnees) : creerCoffre(donnees, user.uid);
            const { isConnected } = await NetInfo.fetch();
            if (isConnected) {
                await envoi;
            } else {
                envoi.catch((e: unknown) => console.warn('Synchronisation du coffre impossible', e));
            }
            return true;
        } catch {
            setErreurEnvoi(
                coffre
                    ? "Le coffre n'a pas pu être modifié. Réessayez dans un instant."
                    : "Le coffre n'a pas pu être créé. Réessayez dans un instant.",
            );
            return false;
        } finally {
            setEnvoiEnCours(false);
        }
    }

    return {
        lieu,
        chargementAdresse,
        nom,
        erreurNom,
        erreurEnvoi,
        envoiEnCours,
        choisirSuggestion,
        choisirCoordonnees,
        modifierNom,
        enregistrer,
    };
}
