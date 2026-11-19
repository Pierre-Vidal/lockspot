type BaseElement = {
    id: string;
    nom: string;
    parentId: string | null;
    creeLe: number;
    modifieLe: number;
};

export type Dossier = BaseElement & { type: 'dossier' };

export type Note = BaseElement & { type: 'note' };

export type FichierCoffre = BaseElement & {
    type: 'image' | 'fichier';
    typeMime: string;
    tailleOctets: number;
};

export type ElementCoffre = Dossier | Note | FichierCoffre;

export type TypeElement = ElementCoffre['type'];

export type Tri = 'recents' | 'nom' | 'type';
