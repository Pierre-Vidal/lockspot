import { useEffect, useState } from 'react';

// Au-delà, on retire le logo même si la carte n'a rien signalé (ex. pas de réseau)
const DELAI_MAX_MS = 8000;

// Suit le chargement de la carte pour afficher le logo en attendant
// Le délai maximum évite de cacher la carte indéfiniment
export function useChargementCarte() {
    const [chargee, setChargee] = useState(false);

    useEffect(() => {
        const minuteur = setTimeout(() => setChargee(true), DELAI_MAX_MS);
        return () => clearTimeout(minuteur);
    }, []);

    return { chargee, surChargee: () => setChargee(true) };
}
