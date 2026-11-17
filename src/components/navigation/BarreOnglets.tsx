import type { BottomTabBarProps } from 'expo-router/tabs';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { couleurs, espacements } from '@/constants/theme';

import { BoutonOnglet } from './BoutonOnglet';

const ONGLET_CENTRAL = 'index';

export function BarreOnglets({ state, descriptors, navigation, insets }: BottomTabBarProps) {
    return (
        <View style={[styles.barre, { paddingBottom: insets.bottom + espacements.sm }]}>
            {state.routes.map((route, index) => {
                const descriptor = descriptors[route.key];
                if (!descriptor) return null;

                const { options } = descriptor;
                const actif = state.index === index;
                const central = route.name === ONGLET_CENTRAL;
                const couleurIcone = central ? couleurs.surface : actif ? couleurs.texte : couleurs.texteSecondaire;

                const allerSurOnglet = () => {
                    const evenement = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!actif && !evenement.defaultPrevented) {
                        Haptics.selectionAsync();
                        navigation.navigate(route.name, route.params);
                    }
                };

                return (
                    <BoutonOnglet
                        key={route.key}
                        libelle={options.title ?? route.name}
                        icone={options.tabBarIcon?.({ focused: actif, color: couleurIcone, size: central ? 32 : 24 })}
                        actif={actif}
                        central={central}
                        onPress={allerSurOnglet}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    barre: {
        flexDirection: 'row',
        paddingTop: espacements.md,
        backgroundColor: couleurs.fond,
    },
});