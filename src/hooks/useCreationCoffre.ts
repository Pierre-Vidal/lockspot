import NetInfo from '@react-native-community/netinfo';
import { useRef, useState } from 'react';

import { NOM_COFFRE_LONGUEUR_MAX } from '@/constants/coffres';
import { useAuth } from '@/hooks/use-auth';
import { creerCoffre } from '@/services/coffres';
import { adresseDepuisCoordonnees, type SuggestionAdresse } from '@/services/geocodage';
import type { Coordonnees } from '@/types/coffre';

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

export function useCreationCoffre() {
    const { user } = useAuth();
    const [lieu, setLieu] = useState<LieuChoisi | null>(null);
    const [chargementAdresse, setChargementAdresse] = useState(false);
    const [nom, setNom] = useState('');
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

    async function creer(): Promise<boolean> {
        const erreur = validerNom(nom);
        setErreurNom(erreur);
        setErreurEnvoi(null);
        if (erreur || !lieu || !user) return false;

        setEnvoiEnCours(true);
        // En ligne, on attend le serveur pour pouvoir afficher une erreur
        // Hors ligne, Firestore envoie le coffre plus tard : inutile de bloquer l'écran
        try {
            const envoi = creerCoffre(
                { nom, adresse: lieu.adresse ?? coordonneesEnTexte(lieu.coordonnees), coordonnees: lieu.coordonnees },
                user.uid,
            );
            const { isConnected } = await NetInfo.fetch();
            if (isConnected) {
                await envoi;
            } else {
                envoi.catch((e: unknown) => console.warn('Synchronisation du coffre impossible', e));
            }
            return true;
        } catch {
            setErreurEnvoi("Le coffre n'a pas pu être créé. Réessayez dans un instant.");
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
        creer,
    };
}