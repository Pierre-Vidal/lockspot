import type { Coordonnees } from '@/types/coffre';

export type PositionMapbox = [longitude: number, latitude: number];

export type Emprise = { ne: PositionMapbox; sw: PositionMapbox };

const RAYON_TERRE_METRES = 6_371_000;

const enRadians = (degres: number) => (degres * Math.PI) / 180;
const enDegres = (radians: number) => (radians * 180) / Math.PI;

export function versPositionMapbox({ latitude, longitude }: Coordonnees): PositionMapbox {
    return [longitude, latitude];
}

export function contourCercle(centre: Coordonnees, rayonMetres: number, nombrePoints = 64): PositionMapbox[] {
    const latitude = enRadians(centre.latitude);
    const longitude = enRadians(centre.longitude);
    const distanceAngulaire = rayonMetres / RAYON_TERRE_METRES;

    const contour: PositionMapbox[] = [];

    for (let i = 0; i <= nombrePoints; i++) {
        const cap = (2 * Math.PI * i) / nombrePoints;
        const latitudePoint = Math.asin(
            Math.sin(latitude) * Math.cos(distanceAngulaire) +
            Math.cos(latitude) * Math.sin(distanceAngulaire) * Math.cos(cap),
        );
        const longitudePoint =
            longitude +
            Math.atan2(
                Math.sin(cap) * Math.sin(distanceAngulaire) * Math.cos(latitude),
                Math.cos(distanceAngulaire) - Math.sin(latitude) * Math.sin(latitudePoint),
            );
        contour.push([enDegres(longitudePoint), enDegres(latitudePoint)]);
    }

    return contour;
}

export function cercleGeographique(centre: Coordonnees, rayonMetres: number): GeoJSON.Polygon {
    return { type: 'Polygon', coordinates: [contourCercle(centre, rayonMetres)] };
}

export function emprise(points: PositionMapbox[]): Emprise | null {
    if (points.length === 0) return null;

    const longitudes = points.map(([longitude]) => longitude);
    const latitudes = points.map(([, latitude]) => latitude);

    return {
        ne: [Math.max(...longitudes), Math.max(...latitudes)],
        sw: [Math.min(...longitudes), Math.min(...latitudes)],
    };
}

/**
 * Distance « à vol d'oiseau » entre deux points, en mètres (formule de haversine).
 * Précise à quelques mètres près à l'échelle d'une ville : largement suffisant ici.
 */
export function distanceMetres(a: Coordonnees, b: Coordonnees): number {
    const deltaLatitude = enRadians(b.latitude - a.latitude);
    const deltaLongitude = enRadians(b.longitude - a.longitude);
    const h =
        Math.sin(deltaLatitude / 2) ** 2 +
        Math.cos(enRadians(a.latitude)) * Math.cos(enRadians(b.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
    return 2 * RAYON_TERRE_METRES * Math.asin(Math.sqrt(h));
}

export function estDansZone(position: Coordonnees, centre: Coordonnees, rayonMetres: number): boolean {
    return distanceMetres(position, centre) <= rayonMetres;
}