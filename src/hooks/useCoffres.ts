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

export function useCoffres(): EtatCoffres {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    const [etat, setEtat] = useState<EtatCoffres>(ETAT_INITIAL);

    useEffect(() => {
        if (!uid) return;

        let actif = true;
        let recuDeFirestore = false;

        AsyncStorage.getItem(cleCache(uid))
            .then((texte) => {
                if (!actif || recuDeFirestore || !texte) return;
                setEtat({ coffres: JSON.parse(texte) as Coffre[], chargement: false, erreur: null });
            })
            .catch(() => {});

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