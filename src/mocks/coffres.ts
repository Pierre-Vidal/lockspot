import type { Coffre } from '@/types/coffre';

/**
 * Données de test, en attendant Firebase.
 * Change les coordonnées pour des lieux proches de toi afin de tester « dans la zone ».
 */
export const COFFRES_DE_TEST: Coffre[] = [
    {
        id: 'maison',
        proprietaireId: 'test',
        nom: 'Maison',
        adresse: '12 rue des Lilas, 69003 Lyon',
        coordonnees: { latitude: 45.7605, longitude: 4.853 },
        creeLe: Date.now(),
    },
    {
        id: 'bureau',
        proprietaireId: 'test',
        nom: 'Bureau',
        adresse: '5 place des Terreaux, 69001 Lyon',
        coordonnees: { latitude: 45.7672, longitude: 4.8336 },
        creeLe: Date.now(),
    },
    {
        id: 'salle-de-sport',
        proprietaireId: 'test',
        nom: 'Salle de sport',
        adresse: '40 cours Gambetta, 69007 Lyon',
        coordonnees: { latitude: 45.7536, longitude: 4.8481 },
        creeLe: Date.now(),
    },
    {
        id: 'ecole',
        proprietaireId: 'test',
        nom: 'Ecole',
        adresse: '2 Esplanade de la Gare, 33110 Le Bouscat',
        coordonnees: { latitude: 44.86626, longitude: -0.57668 },
        creeLe: Date.now(),
    },
];