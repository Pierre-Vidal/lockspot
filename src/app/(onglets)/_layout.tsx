import {router, Tabs} from 'expo-router';

import { Icone } from '@/components/Icone';
import { BarreOnglets } from '@/components/navigation/BarreOnglets';

export default function LayoutOnglets() {
    return (
        <Tabs
            initialRouteName="index"
            tabBar={(props) => <BarreOnglets {...props} />}
            screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="compte"
                options={{
                    title: 'Compte',
                    tabBarIcon: ({ color, size }) => <Icone nom="compte" couleur={color} taille={size} />,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Déverrouiller',
                    tabBarIcon: ({ color, size }) => <Icone nom="empreinte" couleur={color} taille={size} />,
                }}
            />
            <Tabs.Screen
                name="ajouter"
                options={{
                    title: 'Nouveau coffre',
                    tabBarIcon: ({ color, size }) => <Icone nom="ajout" couleur={color} taille={size} />,
                }}
                // Ouverture en plein écran au lieu de changer d'onglet
                listeners={{
                        tabPress: (evenement) => {
                        evenement.preventDefault();
                        router.push('/nouveau-coffre');
                    },
                }}
            />
        </Tabs>
    );
}