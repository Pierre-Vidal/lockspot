import { Tabs } from 'expo-router';

import { Icone } from '@/components/Icone';
import { BarreOnglets } from '@/components/navigation/BarreOnglets';

export default function LayoutOnglets() {
    return (
        // La carte (index) s'ouvre en premier, même si l'onglet Compte est déclaré avant elle.
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
                name="nouveau-coffre"
                options={{
                    title: 'Nouveau coffre',
                    tabBarIcon: ({ color, size }) => <Icone nom="ajout" couleur={color} taille={size} />,
                }}
            />
        </Tabs>
    );
}