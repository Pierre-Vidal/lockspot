import Mapbox from '@rnmapbox/maps';

export function initialiserMapbox() {
    const jeton = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    if (!jeton) {
        throw new Error('EXPO_PUBLIC_MAPBOX_TOKEN manquant : copie .env.local en .env.local et renseigne ton token.');
    }
    Mapbox.setAccessToken(jeton);
}