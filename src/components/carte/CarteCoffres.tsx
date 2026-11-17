import Mapbox, { Camera, FillLayer, LineLayer, LocationPuck, MapView, MarkerView, ShapeSource } from '@rnmapbox/maps';
import { useRef, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { RAYON_ZONE_METRES } from '@/constants/coffres';
import { couleurs } from '@/constants/theme';
import type { Coffre, Coordonnees } from '@/types/coffre';
import { cercleGeographique, contourCercle, emprise, versPositionMapbox } from '@/utils/geo';

import { BoutonRecentrer } from './BoutonRecentrer';
import { MarqueurCoffre } from './MarqueurCoffre';

type Props = {
    coffres: Coffre[];
    positionUtilisateur: Coordonnees | null;
    idCoffreSelectionne: string | null;
    onSelectionCoffre: (idCoffre: string | null) => void;
};

const MARGE_CADRAGE = 48;
const ZOOM_SUR_POSITION = 15;
const DUREE_ANIMATION_MS = 800;

function versZonesGeoJSON(coffres: Coffre[]): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
    return {
        type: 'FeatureCollection',
        features: coffres.map((coffre) => ({
            type: 'Feature',
            id: coffre.id,
            properties: { id: coffre.id },
            geometry: cercleGeographique(coffre.coordonnees, RAYON_ZONE_METRES),
        })),
    };
}

export function CarteCoffres({ coffres, positionUtilisateur, idCoffreSelectionne, onSelectionCoffre }: Props) {
    const camera = useRef<ComponentRef<typeof Camera>>(null);
    const zones = versZonesGeoJSON(coffres);
    const cadrage = emprise(coffres.flatMap((coffre) => contourCercle(coffre.coordonnees, RAYON_ZONE_METRES)));

    function recentrer() {
        if (positionUtilisateur) {
            camera.current?.setCamera({
                centerCoordinate: versPositionMapbox(positionUtilisateur),
                zoomLevel: ZOOM_SUR_POSITION,
                animationMode: 'flyTo',
                animationDuration: DUREE_ANIMATION_MS,
            });
        } else if (cadrage) {
            camera.current?.fitBounds(cadrage.ne, cadrage.sw, MARGE_CADRAGE, DUREE_ANIMATION_MS);
        }
    }

    return (
        <View style={styles.conteneur}>
            <MapView
                style={styles.carte}
                styleURL={Mapbox.StyleURL.Light}
                surfaceView={false}
                scaleBarEnabled={false}
                compassEnabled={false}
                pitchEnabled={false}
                logoPosition={{ bottom: 8, left: 8 }}
                attributionPosition={{ bottom: 8, right: 8 }}
                onPress={() => onSelectionCoffre(null)}>
                <Camera
                    ref={camera}
                    followUserLocation={cadrage === null}
                    followZoomLevel={ZOOM_SUR_POSITION}
                    defaultSettings={
                        cadrage
                            ? {
                                bounds: {
                                    ...cadrage,
                                    paddingTop: MARGE_CADRAGE,
                                    paddingBottom: MARGE_CADRAGE,
                                    paddingLeft: MARGE_CADRAGE,
                                    paddingRight: MARGE_CADRAGE,
                                },
                            }
                            : undefined
                    }
                />

                <LocationPuck pulsing={{ isEnabled: true, color: couleurs.marqueur, radius: 'accuracy' }} />

                <ShapeSource id="zones-coffres" shape={zones}>
                    <FillLayer id="zones-remplissage" style={{ fillColor: couleurs.marqueur, fillOpacity: 0.18 }} />
                    <LineLayer id="zones-contour" style={{ lineColor: couleurs.marqueur, lineOpacity: 0.5, lineWidth: 1.5 }} />
                </ShapeSource>

                {coffres.map((coffre) => (
                    <MarkerView
                        key={coffre.id}
                        coordinate={versPositionMapbox(coffre.coordonnees)}
                        anchor={{ x: 0.5, y: 1 }}
                        allowOverlap
                        allowOverlapWithPuck>
                        <MarqueurCoffre
                            nom={coffre.nom}
                            selectionne={coffre.id === idCoffreSelectionne}
                            onPress={() => onSelectionCoffre(coffre.id)}
                        />
                    </MarkerView>
                ))}
            </MapView>

            <View style={styles.emplacementBouton}>
                <BoutonRecentrer onPress={recentrer} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    conteneur: { flex: 1 },
    carte: { flex: 1 },
    emplacementBouton: { position: 'absolute', top: 12, right: 12 },
});