import {
    addDoc,
    collection,
    onSnapshot,
    query,
    serverTimestamp,
    where,
    type DocumentData,
    type QueryDocumentSnapshot,
    type Timestamp,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { Coffre, NouveauCoffre } from '@/types/coffre';

const COLLECTION_COFFRES = 'coffres';

type DocumentCoffre = Omit<Coffre, 'id' | 'creeLe'> & { creeLe: Timestamp | null };

function versCoffre(document: QueryDocumentSnapshot<DocumentData>): Coffre {
    const donnees = document.data({ serverTimestamps: 'estimate' }) as DocumentCoffre;
    return {
        id: document.id,
        proprietaireId: donnees.proprietaireId,
        nom: donnees.nom,
        adresse: donnees.adresse,
        coordonnees: donnees.coordonnees,
        creeLe: donnees.creeLe?.toMillis() ?? Date.now(),
    };
}

export function ecouterCoffres(
    proprietaireId: string,
    surChangement: (coffres: Coffre[]) => void,
    surErreur: (erreur: Error) => void,
): () => void {
    const requete = query(collection(db, COLLECTION_COFFRES), where('proprietaireId', '==', proprietaireId));

    return onSnapshot(
        requete,
        (resultat) => {
            const coffres = resultat.docs.map(versCoffre).sort((a, b) => a.creeLe - b.creeLe);
            surChangement(coffres);
        },
        surErreur,
    );
}

export async function creerCoffre(nouveauCoffre: NouveauCoffre, proprietaireId: string): Promise<void> {
    await addDoc(collection(db, COLLECTION_COFFRES), {
        nom: nouveauCoffre.nom.trim(),
        adresse: nouveauCoffre.adresse,
        coordonnees: nouveauCoffre.coordonnees,
        proprietaireId,
        creeLe: serverTimestamp(),
    });
}