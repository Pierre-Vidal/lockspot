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

import { supprimerToutLeContenu } from '@/services/contenuCoffres';
import { db } from '@/services/firebase';
import type { Coffre, NouveauCoffre } from '@/types/coffre';

const COLLECTION_COFFRES = 'coffres';

type DocumentCoffre = Omit<Coffre, 'id' | 'creeLe'> & { creeLe: Timestamp | null };

// traduire un document firestore en Coffre
function versCoffre(document: QueryDocumentSnapshot<DocumentData>): Coffre {
    // estimates car le coffre n'a pas encore sa date serveur
    // document -> relatif au document en lui-même
    const donnees = document.data({ serverTimestamps: 'estimate' }) as DocumentCoffre;
    return {
        id: document.id,
        // donnees -> relatif au contenu
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

    // snapshot permet l'envoi de la liste puis le renvoi à chaque changement
    // principe d'abonnement, on ne demande pas nous-même s'il y a un nouveau coffre
    return onSnapshot(
        // ce que je veux
        requete,
        // une fois la réponse obtenu, je lance ce code
        (resultat) => {
            // création d'une nouvelle liste listant tous les objets Coffre depuis les documents reçus de firebase
            const coffres = resultat.docs.map(versCoffre).sort((a, b) => a.creeLe - b.creeLe);
            // fonction callback -> utiliser par useCoffres qui l'affiche et la garde en cache
            surChangement(coffres);
        },
        // si ça échoue
        surErreur,
    );
}

export async function creerCoffre(nouveauCoffre: NouveauCoffre, proprietaireId: string): Promise<void> {
    // ajout fiche(où, quoi)
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
