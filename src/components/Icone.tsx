import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

const SYMBOLES = {
    compte: { ios: 'person', android: 'person', web: 'person' },
    empreinte: { ios: 'touchid', android: 'fingerprint', web: 'fingerprint' },
    ajout: { ios: 'plus', android: 'add', web: 'add' },
    cadenas: { ios: 'lock.fill', android: 'lock', web: 'lock' },
    chevronDroite: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
    recentrer: { ios: 'location.fill', android: 'my_location', web: 'my_location' },
} as const satisfies Record<string, SymbolViewProps['name']>;

export type NomIcone = keyof typeof SYMBOLES;

type Props = {
    nom: NomIcone;
    couleur: ColorValue;
    taille?: number;
};

export function Icone({ nom, couleur, taille = 24 }: Props) {
    return <SymbolView name={SYMBOLES[nom]} tintColor={couleur} size={taille} />;
}