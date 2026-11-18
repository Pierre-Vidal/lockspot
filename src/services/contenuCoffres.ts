import { aesDecryptAsync, aesEncryptAsync, AESSealedData, randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';

import { obtenirCle } from '@/services/cleContenu';
import type { Dossier, ElementCoffre, FichierCoffre, Note } from '@/types/contenu';
import { avecDescendants, toucherParents } from '@/utils/arborescence';
import { jsonVersOctets, octetsVersJson } from '@/utils/octets';

export type SourceFichier = {
    uri: string;
    nom: string;
    typeMime: string;
};

export const TAILLE_MAX_OCTETS = 20 * 1024 * 1024;

export class ErreurContenu extends Error {}

const NOM_INDEX = 'index.bin';

function dossierDuCoffre(idCoffre: string): Directory {
    const dossier = new Directory(Paths.document, 'coffres', idCoffre);
    if (!dossier.exists) dossier.create({ intermediates: true });
    return dossier;
}

const fichierDonnees = (idCoffre: string, idElement: string) => new File(dossierDuCoffre(idCoffre), `${idElement}.bin`);

async function chiffrer(octets: Uint8Array): Promise<Uint8Array> {
    const scelle = await aesEncryptAsync(octets, await obtenirCle());
    return scelle.combined();
}

async function dechiffrer(octets: Uint8Array): Promise<Uint8Array> {
    return aesDecryptAsync(AESSealedData.fromCombined(octets), await obtenirCle());
}

function ecrire(fichier: File, octets: Uint8Array) {
    if (!fichier.exists) fichier.create();
    fichier.write(octets);
}

async function lireIndex(idCoffre: string): Promise<ElementCoffre[]> {
    const index = new File(dossierDuCoffre(idCoffre), NOM_INDEX);
    if (!index.exists) return [];
    return octetsVersJson<ElementCoffre[]>(await dechiffrer(await index.bytes()));
}

async function ecrireIndex(idCoffre: string, elements: ElementCoffre[]) {
    ecrire(new File(dossierDuCoffre(idCoffre), NOM_INDEX), await chiffrer(jsonVersOctets(elements)));
}

const filesDAttente = new Map<string, Promise<unknown>>();

function enSerie<T>(idCoffre: string, tache: () => Promise<T>): Promise<T> {
    const precedente = filesDAttente.get(idCoffre) ?? Promise.resolve();
    const suivante = precedente.catch(() => {}).then(tache);
    filesDAttente.set(idCoffre, suivante);
    return suivante;
}

/** Lit l'index, applique `modifier`, réécrit l'index, le tout sans être interrompu par une autre modification. */
function modifierIndex(idCoffre: string, modifier: (elements: ElementCoffre[]) => ElementCoffre[] | Promise<ElementCoffre[]>) {
    return enSerie(idCoffre, async () => {
        const elements = await modifier(await lireIndex(idCoffre));
        await ecrireIndex(idCoffre, elements);
        return elements;
    });
}

export function listerElements(idCoffre: string): Promise<ElementCoffre[]> {
    return enSerie(idCoffre, () => lireIndex(idCoffre));
}

export function creerDossier(idCoffre: string, nom: string, parentId: string | null): Promise<ElementCoffre[]> {
    const maintenant = Date.now();
    const dossier: Dossier = { id: randomUUID(), type: 'dossier', nom: nom.trim(), parentId, creeLe: maintenant, modifieLe: maintenant };
    return modifierIndex(idCoffre, (elements) => toucherParents([...elements, dossier], parentId, maintenant));
}

export function ajouterFichier(idCoffre: string, source: SourceFichier, parentId: string | null): Promise<ElementCoffre[]> {
    return modifierIndex(idCoffre, async (elements) => {
        const fichierSource = new File(source.uri);
        const octets = await fichierSource.bytes();
        if (octets.length > TAILLE_MAX_OCTETS) {
            effacerCopieTemporaire(fichierSource);
            throw new ErreurContenu(`« ${source.nom} » est trop volumineux (${TAILLE_MAX_OCTETS / 1024 / 1024} Mo maximum).`);
        }

        const maintenant = Date.now();
        const element: FichierCoffre = {
            id: randomUUID(),
            type: source.typeMime.startsWith('image/') ? 'image' : 'fichier',
            nom: source.nom,
            typeMime: source.typeMime,
            tailleOctets: octets.length,
            parentId,
            creeLe: maintenant,
            modifieLe: maintenant,
        };
        ecrire(fichierDonnees(idCoffre, element.id), await chiffrer(octets));
        effacerCopieTemporaire(fichierSource);
        return toucherParents([...elements, element], parentId, maintenant);
    });
}

export function creerNote(idCoffre: string, titre: string, texte: string, parentId: string | null): Promise<ElementCoffre[]> {
    return modifierIndex(idCoffre, async (elements) => {
        const maintenant = Date.now();
        const note: Note = { id: randomUUID(), type: 'note', nom: titre.trim(), parentId, creeLe: maintenant, modifieLe: maintenant };
        ecrire(fichierDonnees(idCoffre, note.id), await chiffrer(jsonVersOctets(texte)));
        return toucherParents([...elements, note], parentId, maintenant);
    });
}

export async function lireNote(idCoffre: string, idNote: string): Promise<string> {
    return octetsVersJson<string>(await dechiffrer(await fichierDonnees(idCoffre, idNote).bytes()));
}

export function modifierNote(idCoffre: string, idNote: string, titre: string, texte: string): Promise<ElementCoffre[]> {
    return modifierIndex(idCoffre, async (elements) => {
        ecrire(fichierDonnees(idCoffre, idNote), await chiffrer(jsonVersOctets(texte)));
        const maintenant = Date.now();
        const note = elements.find((element) => element.id === idNote);
        const misAJour = elements.map((element) =>
            element.id === idNote ? { ...element, nom: titre.trim(), modifieLe: maintenant } : element,
        );
        return toucherParents(misAJour, note?.parentId ?? null, maintenant);
    });
}

export async function lireEnOctets(idCoffre: string, idElement: string): Promise<Uint8Array> {
    return dechiffrer(await fichierDonnees(idCoffre, idElement).bytes());
}

export async function lireEnBase64(idCoffre: string, idElement: string): Promise<string> {
    const octets = await fichierDonnees(idCoffre, idElement).bytes();
    return aesDecryptAsync(AESSealedData.fromCombined(octets), await obtenirCle(), { output: 'base64' });
}

export function renommer(idCoffre: string, idElement: string, nom: string): Promise<ElementCoffre[]> {
    return modifierIndex(idCoffre, (elements) => {
        const maintenant = Date.now();
        const element = elements.find((candidat) => candidat.id === idElement);
        const misAJour = elements.map((candidat) =>
            candidat.id === idElement ? { ...candidat, nom: nom.trim(), modifieLe: maintenant } : candidat,
        );
        return toucherParents(misAJour, element?.parentId ?? null, maintenant);
    });
}

export function deplacer(idCoffre: string, idElement: string, nouveauParentId: string | null): Promise<ElementCoffre[]> {
    return modifierIndex(idCoffre, (elements) => {
        if (nouveauParentId !== null && avecDescendants(elements, idElement).has(nouveauParentId)) {
            throw new ErreurContenu('Impossible de ranger un dossier dans lui-même.');
        }
        const maintenant = Date.now();
        const ancienParentId = elements.find((element) => element.id === idElement)?.parentId ?? null;
        const misAJour = elements.map((element) =>
            element.id === idElement ? { ...element, parentId: nouveauParentId } : element,
        );
        return toucherParents(toucherParents(misAJour, ancienParentId, maintenant), nouveauParentId, maintenant);
    });
}

export function supprimer(idCoffre: string, idElement: string): Promise<ElementCoffre[]> {
    return modifierIndex(idCoffre, (elements) => {
        const aSupprimer = avecDescendants(elements, idElement);
        const parentId = elements.find((element) => element.id === idElement)?.parentId ?? null;
        for (const id of aSupprimer) {
            const fichier = fichierDonnees(idCoffre, id);
            if (fichier.exists) fichier.delete();
        }
        const restants = elements.filter((element) => !aSupprimer.has(element.id));
        return toucherParents(restants, parentId, Date.now());
    });
}

export function supprimerToutLeContenu(idCoffre: string) {
    const dossier = new Directory(Paths.document, 'coffres', idCoffre);
    if (dossier.exists) dossier.delete();
}

function effacerCopieTemporaire(fichier: File) {
    if (!fichier.uri.startsWith(Paths.cache.uri)) return;
    try {
        fichier.delete();
    } catch {
        // Déjà supprimée par le système : rien à faire.
    }
}
