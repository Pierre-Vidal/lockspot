export const DUREE_OUVERTURE_MS = 5 * 60 * 1000;

const ouvertures = new Map<string, number>();

export function enregistrerOuverture(idCoffre: string) {
    ouvertures.set(idCoffre, Date.now());
}

export function estOuvert(idCoffre: string): boolean {
    const ouvertLe = ouvertures.get(idCoffre);
    return ouvertLe !== undefined && Date.now() - ouvertLe < DUREE_OUVERTURE_MS;
}

export function tempsRestant(idCoffre: string): number {
    const ouvertLe = ouvertures.get(idCoffre);
    return ouvertLe === undefined ? 0 : Math.max(0, DUREE_OUVERTURE_MS - (Date.now() - ouvertLe));
}

export function refermer(idCoffre: string) {
    ouvertures.delete(idCoffre);
}