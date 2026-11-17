import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
    type DocumentData,
    type QueryDocumentSnapshot,
    type Timestamp,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { Coffre, NouveauCoffre } from '@/types/coffre';

const COLLECTION_COFFRES = 'coffres';

type DocumentCoffre = Omit<Coffre, 'id' | 'creeLe'> & { creeLe: Timestamp | null };

function versCoffre(document: QueryDocumentSnapshot<DocumentData>): Coffre {
    // estimates car le coffre n'a pas encore sa date serveur
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
    // filtre pour refuser une requête pouvant renvoyer les coffres d'un autre utilisateur
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

/** Met à jour le nom, l'adresse et l'emplacement d'un coffre. Le propriétaire et la date de création ne changent pas. */
export async function modifierCoffre(id: string, modifications: NouveauCoffre): Promise<void> {
    await updateDoc(doc(db, COLLECTION_COFFRES, id), {
        nom: modifications.nom.trim(),
        adresse: modifications.adresse,
        coordonnees: modifications.coordonnees,
    });
}

export async function supprimerCoffre(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_COFFRES, id));
}

/**
 * Supprime tous les coffres d'un utilisateur.
 * À appeler avant la suppression de son compte : une fois déconnecté, il ne pourrait plus le faire.
 */
export async function supprimerTousLesCoffres(proprietaireId: string): Promise<void> {
    const requete = query(collection(db, COLLECTION_COFFRES), where('proprietaireId', '==', proprietaireId));
    const resultat = await getDocs(requete);
    if (resultat.empty) return;

    // Un lot Firestore accepte 500 opérations au maximum.
    const TAILLE_LOT = 500;
    for (let debut = 0; debut < resultat.docs.length; debut += TAILLE_LOT) {
        const lot = writeBatch(db);
        resultat.docs.slice(debut, debut + TAILLE_LOT).forEach((document) => lot.delete(document.ref));
        await lot.commit();
    }
}
