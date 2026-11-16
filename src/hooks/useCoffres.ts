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

const ETAT_INITIAL: EtatCoffres = { coffres: [], chargement: true, erreur: null };

const cleCache = (uid: string) => `lockspot:coffres:${uid}`;

// Le SDK Firebase JS ne garde rien sur le disque : on met en cache la dernière liste dans AsyncStroage pour l'affichage hors ligne
export function useCoffres(): EtatCoffres {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    const [etat, setEtat] = useState<EtatCoffres>(ETAT_INITIAL);

    useEffect(() => {
        if (!uid) return;

        let actif = true;
        // Si Firestore répond avant le cache, le cache ne l'écrase pas
        let recuDeFirestore = false;

        AsyncStorage.getItem(cleCache(uid))
            .then((texte) => {
                if (!actif || recuDeFirestore || !texte) return;
                setEtat({ coffres: JSON.parse(texte) as Coffre[], chargement: false, erreur: null });
            })
            .catch(() => {
                // cache illisible
            });

        const seDesabonner = ecouterCoffres(
            uid,
            (coffres) => {
                recuDeFirestore = true;
                setEtat({ coffres, chargement: false, erreur: null });
                AsyncStorage.setItem(cleCache(uid), JSON.stringify(coffres)).catch(() => {});
            },
            () => {
                setEtat((precedent) => ({
                    ...precedent,
                    chargement: false,
                    erreur: 'Impossible de charger vos coffres. Vérifiez votre connexion.',
                }));
            },
        );
        return () => {
            actif = false;
            seDesabonner();
        };
    }, [uid]);

    return uid ? etat : ETAT_INITIAL;
}