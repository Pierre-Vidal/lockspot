export function jsonVersOctets(valeur: unknown): Uint8Array {
    const json = JSON.stringify(valeur).replace(
        /[\u0080-￿]/g,
        (caractere) => `\\u${caractere.charCodeAt(0).toString(16).padStart(4, '0')}`,
    );
    return Uint8Array.from(json, (caractere) => caractere.charCodeAt(0));
}

export function octetsVersJson<T>(octets: Uint8Array): T {
    let texte = '';
    for (let debut = 0; debut < octets.length; debut += 8192) {
        texte += String.fromCharCode(...octets.subarray(debut, debut + 8192));
    }
    return JSON.parse(texte) as T;
}
