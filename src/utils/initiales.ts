/**
 * Initiales affichées dans l'avatar : « camille.d » → « CD », « camille » → « CA ».
 * À défaut de nom, on part du début de l'adresse e-mail.
 */
export function initiales(nom: string | null | undefined, email?: string | null): string {
    const base = nom?.trim() || email?.split('@')[0]?.trim() || '';
    const mots = base.split(/[\s._-]+/).filter(Boolean);

    const premier = mots[0];
    if (!premier) return '?';

    const second = mots[1];
    return (second ? premier.charAt(0) + second.charAt(0) : premier.slice(0, 2)).toUpperCase();
}
