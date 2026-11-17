import type { Coordonnees } from '@/types/coffre';

const URL_API = 'https://api.mapbox.com/search/geocode/v6';
const PAYS = 'fr';
const LANGUE = 'fr';
const NOMBRE_SUGGESTIONS = 5;

export type SuggestionAdresse = {
    id: string;
    nom: string;
    contexte: string;
    adresse: string;
    coordonnees: Coordonnees;
};

type ReponseMapbox = {
    features: {
        properties: {
            mapbox_id: string;
            name: string;
            place_formatted?: string;
            full_address?: string;
            coordinates: { longitude: number; latitude: number };
        };
    }[];
};

type OptionsRecherche = {
    proximite?: Coordonnees | null;
    signal?: AbortSignal;
};

function jetonMapbox(): string {
    const jeton = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    if (!jeton) throw new Error('EXPO_PUBLIC_MAPBOX_TOKEN manquant.');
    return jeton;
}

async function appelerMapbox(chemin: 'forward' | 'reverse', parametres: Record<string, string | undefined>, signal?: AbortSignal) {
    const requete = new URLSearchParams({ language: LANGUE, country: PAYS, access_token: jetonMapbox() });
    for (const [cle, valeur] of Object.entries(parametres)) {
        if (valeur !== undefined) requete.set(cle, valeur);
    }
    const reponse = await fetch(`${URL_API}/${chemin}?${requete.toString()}`, { signal });
    if (!reponse.ok) {
        throw new Error(`Géocodage Mapbox impossible (HTTP ${reponse.status}).`);
    }
    const donnees: ReponseMapbox = await reponse.json();
    return donnees.features.map(({ properties }): SuggestionAdresse => ({
        id: properties.mapbox_id,
        nom: properties.name,
        contexte: properties.place_formatted ?? '',
        adresse: properties.full_address ?? properties.name,
        coordonnees: {
            latitude: properties.coordinates.latitude,
            longitude: properties.coordinates.longitude,
        },
    }));
}

export function rechercherAdresses(texte: string, { proximite, signal }: OptionsRecherche = {}): Promise<SuggestionAdresse[]> {
    return appelerMapbox(
        'forward',
        {
            q: texte,
            autocomplete: 'true',
            limit: String(NOMBRE_SUGGESTIONS),
            types: 'address,street,place',
            proximity: proximite ? `${proximite.longitude},${proximite.latitude}` : undefined,
        },
        signal,
    );
}

export async function adresseDepuisCoordonnees({ latitude, longitude }: Coordonnees, signal?: AbortSignal): Promise<string | null> {
    const resultats = await appelerMapbox(
        'reverse',
        { longitude: String(longitude), latitude: String(latitude), types: 'address,street,place' },
        signal,
    );
    return resultats[0]?.adresse ?? null;
}