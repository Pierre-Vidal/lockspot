// Délai avant de re-notifier pour le même coffre
export const DELAI_ENTRE_NOTIFICATIONS_MS = 30 * 60 * 1000;

// Après une notification immédiate, la surveillance reste muette ce temps-là (pas de doublon)
export const DELAI_ANTI_DOUBLON_MS = 2 * 60 * 1000;

// Valeur de « ouvrir » quand la notification ne vise pas un coffre précis : on ouvre celui de la zone
export const OUVRIR_COFFRE_DANS_LA_ZONE = 'dans-la-zone';
