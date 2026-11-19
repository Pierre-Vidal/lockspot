import Mapbox, { Camera, FillLayer, LineLayer, LocationPuck, MapView, MarkerView, ShapeSource } from '@rnmapbox/maps';
import { StyleSheet, Text, View } from 'react-native';

import { EpingleCoffre } from '@/components/coffres/EpingleCoffre';
import { RAYON_ZONE_METRES } from '@/constants/coffres';
import { arrondis, couleurs, polices } from '@/constants/theme';
import type { Coordonnees } from '@/types/coffre';
import { cercleGeographique, contourCercle, versPositionMapbox } from '@/utils/geo';

type Props = {
    lieu: Coordonnees | null;
    onChoisirCoordonnees: (coordonnees: Coordonnees) => void;
    /** Appelé quand la carte est chargée (ou n'a pas pu l'être) : l'écran peut retirer son logo de chargement. */
    onChargee?: () => void;
};

const CENTRE_FRANCE: [number, number] = [2.35, 46.6];
const ZOOM_FRANCE = 4.5;
const ZOOM_LIEU = 16;
const ZOOM_POSITION = 15;

export function CarteChoixLieu({ lieu, onChoisirCoordonnees, onChargee }: Props) {
    const basDeLaZone = lieu ? contourCercle(lieu, RAYON_ZONE_METRES)[32] : undefined;

    return (
        <MapView
            style={styles.carte}
            styleURL={Mapbox.StyleURL.Light}
            scaleBarEnabled={false}
            compassEnabled={false}
            pitchEnabled={false}
            logoPosition={{ bottom: 36, left: 8 }}
            attributionPosition={{ bottom: 36, right: 8 }}
            onDidFinishLoadingMap={onChargee}
            onMapLoadingError={onChargee}
            onPress={(point) => {
                const [longitude, latitude] = point.geometry.coordinates;
                if (longitude !== undefined && latitude !== undefined) onChoisirCoordonnees({ latitude, longitude });
            }}>
            <Camera
                defaultSettings={
                    lieu
                        ? { centerCoordinate: versPositionMapbox(lieu), zoomLevel: ZOOM_LIEU }
                        : { centerCoordinate: CENTRE_FRANCE, zoomLevel: ZOOM_FRANCE }
                }
                // Suivi de la géoloc de l'utilisateur tant qu'aucun lieu n'est choisi + vol quand il a été choisi
                followUserLocation={!lieu}
                followZoomLevel={ZOOM_POSITION}
                centerCoordinate={lieu ? versPositionMapbox(lieu) : undefined}
                zoomLevel={lieu ? ZOOM_LIEU : undefined}
                animationMode="flyTo"
                animationDuration={700}
            />

            <LocationPuck pulsing={{ isEnabled: true, color: couleurs.marqueur, radius: 'accuracy' }} />

            {lieu && (
                <ShapeSource id="zone-nouveau-coffre" shape={cercleGeographique(lieu, RAYON_ZONE_METRES)}>
                    <FillLayer id="zone-nouveau-coffre-remplissage" style={{ fillColor: couleurs.marqueur, fillOpacity: 0.18 }} />
                    <LineLayer
                        id="zone-nouveau-coffre-contour"
                        style={{ lineColor: couleurs.marqueur, lineOpacity: 0.5, lineWidth: 1.5 }}
                    />
                </ShapeSource>
            )}

            {lieu && (
                <MarkerView coordinate={versPositionMapbox(lieu)} anchor={{ x: 0.5, y: 1 }} allowOverlap allowOverlapWithPuck>
                    <View style={styles.epingle}>
                        <EpingleCoffre taille={40} />
                    </View>
                </MarkerView>
            )}

            {basDeLaZone && (
                <MarkerView coordinate={basDeLaZone} anchor={{ x: 0.5, y: 0.5 }} allowOverlap allowOverlapWithPuck>
                    <View style={styles.etiquette}>
                        <Text style={styles.texteEtiquette}>Zone de {RAYON_ZONE_METRES} m</Text>
                    </View>
                </MarkerView>
            )}
        </MapView>
    );
}

const styles = StyleSheet.create({
    carte: { flex: 1 },
    epingle: { paddingBottom: 10, paddingHorizontal: 8 },
    etiquette: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: arrondis.pilule,
        backgroundColor: couleurs.surface,
        boxShadow: '0 2px 8px rgba(28, 41, 38, 0.12)',
    },
    texteEtiquette: { fontFamily: polices.gras, fontSize: 11, color: couleurs.texte },
});