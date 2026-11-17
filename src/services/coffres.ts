import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    where,
    writeBatch,
    type DocumentData,
    type QueryDocumentSnapshot,
    type Timestamp,
} from 'firebase/firestore';

import { supprimerToutLeContenu } from '@/services/contenuCoffres';
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

export async function supprimerCoffre(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_COFFRES, id));
    // Après Firestore seulement : si la suppression échoue, le coffre et son contenu restent intacts.
    supprimerToutLeContenu(id);
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
        const documents = resultat.docs.slice(debut, debut + TAILLE_LOT);
        documents.forEach((document) => lot.delete(document.ref));
        await lot.commit();
        documents.forEach((document) => supprimerToutLeContenu(document.id));
    }
}
