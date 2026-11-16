export type Coordonnees = {
    latitude: number;
    longitude: number;
};

export type Coffre = {
    id: string;
    proprietaireId: string;
    nom: string;
    adresse: string;
    coordonnees: Coordonnees;
    creeLe: number;
};

export type NouveauCoffre = Omit<Coffre, 'id' | 'proprietaireId' | 'creeLe'>;