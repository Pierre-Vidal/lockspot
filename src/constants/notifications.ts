/** Après une notification pour un coffre, on n'en renvoie pas pour lui avant ce délai. */
export const DELAI_ENTRE_NOTIFICATIONS_MS = 30 * 60 * 1000;

/**
 * Après une notification immédiate (coffre créé ou déplacé là où on se trouve),
 * la surveillance en arrière-plan reste muette ce temps-là, pour ne pas prévenir deux fois.
 */
export const DELAI_ANTI_DOUBLON_MS = 2 * 60 * 1000;

/**
 * Valeur du paramètre `ouvrir` de la carte quand la notification ne désigne pas un coffre précis :
 * on tente alors d'ouvrir celui dans la zone duquel on se trouve.
 */
export const OUVRIR_COFFRE_DANS_LA_ZONE = 'dans-la-zone';
