import { useEffect, useState } from 'react';

/** Au-delà, on retire l'écran de chargement même si la carte n'a rien signalé (réseau absent, par exemple). */
const DELAI_MAX_MS = 8000;

/**
 * Suit le chargement d'une carte Mapbox, pour afficher le logo tant qu'elle n'est pas dessinée.
 * `surChargee` se branche sur la carte ; le délai maximum évite de la cacher indéfiniment.
 */
export function useChargementCarte() {
    const [chargee, setChargee] = useState(false);

    useEffect(() => {
        const minuteur = setTimeout(() => setChargee(true), DELAI_MAX_MS);
        return () => clearTimeout(minuteur);
    }, []);

    return { chargee, surChargee: () => setChargee(true) };
}
