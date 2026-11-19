import { useNetInfo } from '@react-native-community/netinfo';

export function useHorsLigne(): boolean {
    const { isConnected, isInternetReachable } = useNetInfo();
    return isConnected === false || isInternetReachable === false;
}