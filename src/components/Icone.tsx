import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

const SYMBOLES = {
    compte: { ios: 'person', android: 'person', web: 'person' },
    empreinte: { ios: 'touchid', android: 'fingerprint', web: 'fingerprint' },
    ajout: { ios: 'plus', android: 'add', web: 'add' },
    cadenas: { ios: 'lock.fill', android: 'lock', web: 'lock' },
    chevronDroite: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
    recentrer: { ios: 'location.fill', android: 'my_location', web: 'my_location' },
    retour: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
    recherche: { ios: 'magnifyingglass', android: 'search', web: 'search' },
    lieu: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
    effacer: { ios: 'xmark', android: 'close', web: 'close' },
    oeil: { ios: 'eye', android: 'visibility', web: 'visibility' },
    oeilBarre: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
    cloche: { ios: 'bell', android: 'notifications', web: 'notifications' },
    reglages: { ios: 'gearshape', android: 'settings', web: 'settings' },
    deconnexion: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
    corbeille: { ios: 'trash', android: 'delete', web: 'delete' },
    suppressionCompte: { ios: 'person.crop.circle.badge.xmark', android: 'person_off', web: 'person_off' },
    cadenasOuvert: { ios: 'lock.open.fill', android: 'lock_open', web: 'lock_open' },
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