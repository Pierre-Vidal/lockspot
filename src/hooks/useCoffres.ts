import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { ecouterCoffres } from '@/services/coffres';
import type { Coffre } from '@/types/coffre';

type EtatCoffres = {
    coffres: Coffre[];
    chargement: boolean;
    erreur: string | null;
};

// sert de case mémoire, aucun coffre
// chargement: true car on attend encore la liste des coffres
const ETAT_INITIAL: EtatCoffres = { coffres: [], chargement: true, erreur: null };

// Une clé = un utilisateur
const cleCache = (uid: string) => `lockspot:coffres:${uid}`;

// Liste les coffres de l'utilisateur connecté
export function useCoffres(): EtatCoffres {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    // création case mémoire avec etat comme contenu avec une valeur de départ
    const [etat, setEtat] = useState<EtatCoffres>(ETAT_INITIAL);

    useEffect(() => {
        if (!uid) return;

        // indique si l'écran est actif au moment de la réponse
        let actif = true;
        // indique si firestore répond avant le cache
        let recuDeFirestore = false;

        // demande la dernière liste de coffres enregistré en local
        AsyncStorage.getItem(cleCache(uid))
            // texte = réponse reçue suite à l'appel fait au cache
            // AsyncStorage ne stocke que du texte
            .then((texte) => {
                if (!actif || recuDeFirestore || !texte) return;
                // conversion du texte reçu en tableau d'objets Coffre
                // chargement: false car on attend plus de retour pour la liste de coffres
                setEtat({ coffres: JSON.parse(texte) as Coffre[], chargement: false, erreur: null });
            })
            .catch(() => {
                // cache illisible : on attend Firestore
            });

        // demande la liste à firestore + je demande à être prévenu en cas de changement
        const seDesabonner = ecouterCoffres(
            uid,
            (coffres) => {
                recuDeFirestore = true;
                setEtat({ coffres, chargement: false, erreur: null });
                // envoi à AsyncStorage la nouvelle liste
                // conversion des objets en texte
                AsyncStorage.setItem(cleCache(uid), JSON.stringify(coffres)).catch(() => {});
            },
            () => {
                // precedent : nom générique
                setEtat((precedent) => ({
                    // ... -> recopie tous les champs de l'état actuel
                    ...precedent,
                    chargement: false,
                    erreur: 'Impossible de charger vos coffres. Vérifiez votre connexion.',
                }));
            },
        );
        // ferme l'écoute Firestore quand l'écran se ferme ou que le compte change
        return () => {
            actif = false;
            seDesabonner();
        };
    }, [uid]);

    //
    return uid ? etat : ETAT_INITIAL;
}