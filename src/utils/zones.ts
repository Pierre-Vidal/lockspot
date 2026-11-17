import { RAYON_ZONE_METRES } from '@/constants/coffres';
import type { Coffre, Coordonnees } from '@/types/coffre';
import { distanceMetres } from '@/utils/geo';

export type CoffreAOuvrir =
    | { type: 'dans-zone'; coffre: Coffre }
    | { type: 'selection-hors-zone'; coffre: Coffre; distanceMetres: number }
    | { type: 'hors-zone'; plusProche: Coffre | null; distanceMetres: number | null };

export function chercherCoffreAOuvrir(
    coffres: Coffre[],
    position: Coordonnees,
    idCoffreSelectionne: string | null,
): CoffreAOuvrir {
    const selectionne = coffres.find((coffre) => coffre.id === idCoffreSelectionne);
    if (selectionne) {
        const distance = distanceMetres(position, selectionne.coordonnees);
        return distance <= RAYON_ZONE_METRES
            ? { type: 'dans-zone', coffre: selectionne }
            : { type: 'selection-hors-zone', coffre: selectionne, distanceMetres: distance };
    }

    const parDistance = coffres
        .map((coffre) => ({ coffre, distance: distanceMetres(position, coffre.coordonnees) }))
        .sort((a, b) => a.distance - b.distance);

    const plusProcheDansLaZone = parDistance.find(({ distance }) => distance <= RAYON_ZONE_METRES);
    if (plusProcheDansLaZone) return { type: 'dans-zone', coffre: plusProcheDansLaZone.coffre };

    const plusProche = parDistance[0];
    return {
        type: 'hors-zone',
        plusProche: plusProche?.coffre ?? null,
        distanceMetres: plusProche?.distance ?? null,
    };
}

export function formaterDistance(metres: number): string {
    const arrondi = Math.round(metres);
    if (arrondi < 1000) return `${arrondi} m`;
    return `${(metres / 1000).toFixed(1).replace('.', ',')} km`;
}