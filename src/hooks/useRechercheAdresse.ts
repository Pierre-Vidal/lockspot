import { useEffect, useState } from 'react';

import { rechercherAdresses, type SuggestionAdresse } from '@/services/geocodage';
import type { Coordonnees } from '@/types/coffre';

const DELAI_SAISIE_MS = 300;
const LONGUEUR_MINIMALE = 3;

type EtatRecherche = {
    suggestions: SuggestionAdresse[];
    chargement: boolean;
    erreur: string | null;
};

const ETAT_VIDE: EtatRecherche = { suggestions: [], chargement: false, erreur: null };

export function useRechercheAdresse(texte: string, proximite: Coordonnees | null): EtatRecherche {
    const [etat, setEtat] = useState<EtatRecherche>(ETAT_VIDE);
    const requete = texte.trim();
    const rechercheActive = requete.length >= LONGUEUR_MINIMALE;

    const latitudeProche = proximite ? Number(proximite.latitude.toFixed(2)) : null;
    const longitudeProche = proximite ? Number(proximite.longitude.toFixed(2)) : null;

    useEffect(() => {
        if (!rechercheActive) return;

        const controleur = new AbortController();
        const minuteur = setTimeout(async () => {
            setEtat((precedent) => ({ ...precedent, chargement: true, erreur: null }));
            try {
                const suggestions = await rechercherAdresses(requete, {
                    proximite:
                        latitudeProche !== null && longitudeProche !== null
                            ? { latitude: latitudeProche, longitude: longitudeProche }
                            : null,
                    signal: controleur.signal,
                });
                setEtat({ suggestions, chargement: false, erreur: null });
            } catch {
                if (controleur.signal.aborted) return;
                setEtat({ suggestions: [], chargement: false, erreur: 'Recherche impossible. Vérifiez votre connexion.' });
            }
        }, DELAI_SAISIE_MS);

        return () => {
            clearTimeout(minuteur);
            controleur.abort();
        };
    }, [requete, rechercheActive, latitudeProche, longitudeProche]);

    return rechercheActive ? etat : ETAT_VIDE;
}