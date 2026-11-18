import type { Dossier, ElementCoffre, Tri, TypeElement } from '@/types/contenu';

const ORDRE_DES_TYPES: Record<TypeElement, number> = { dossier: 0, note: 1, image: 2, fichier: 3 };

const comparerNoms = (a: ElementCoffre, b: ElementCoffre) =>
    a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base', numeric: true });

export function contenuDuDossier(elements: ElementCoffre[], dossierId: string | null, tri: Tri): ElementCoffre[] {
    return elements
        .filter((element) => element.parentId === dossierId)
        .sort((a, b) => {
            const dossierEnPremier = Number(b.type === 'dossier') - Number(a.type === 'dossier');
            if (dossierEnPremier !== 0) return dossierEnPremier;
            if (tri === 'nom') return comparerNoms(a, b);
            if (tri === 'type') return ORDRE_DES_TYPES[a.type] - ORDRE_DES_TYPES[b.type] || comparerNoms(a, b);
            return b.modifieLe - a.modifieLe;
        });
}

export function cheminVers(elements: ElementCoffre[], dossierId: string | null): Dossier[] {
    const chemin: Dossier[] = [];
    let courant = dossierId;
    while (courant !== null && chemin.length < elements.length) {
        const dossier = elements.find((element): element is Dossier => element.id === courant && element.type === 'dossier');
        if (!dossier) break;
        chemin.unshift(dossier);
        courant = dossier.parentId;
    }
    return chemin;
}

export function toucherParents(elements: ElementCoffre[], dossierId: string | null, maintenant: number): ElementCoffre[] {
    const parents = new Set(cheminVers(elements, dossierId).map((dossier) => dossier.id));
    return elements.map((element) => (parents.has(element.id) ? { ...element, modifieLe: maintenant } : element));
}

export function avecDescendants(elements: ElementCoffre[], id: string): Set<string> {
    const ids = new Set([id]);
    let ajout = true;
    while (ajout) {
        ajout = false;
        for (const element of elements) {
            if (element.parentId !== null && ids.has(element.parentId) && !ids.has(element.id)) {
                ids.add(element.id);
                ajout = true;
            }
        }
    }
    return ids;
}
