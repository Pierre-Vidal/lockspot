const UN_JOUR_MS = 24 * 60 * 60 * 1000;

export function formaterTaille(octets: number): string {
    if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} Ko`;
    return `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
}

export function formaterDate(horodatage: number, maintenant = Date.now()): string {
    const date = new Date(horodatage);
    const memeAnnee = date.getFullYear() === new Date(maintenant).getFullYear();
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: memeAnnee ? undefined : 'numeric' });
}

export function formaterDateRelative(horodatage: number, maintenant = Date.now()): string {
    const debutDuJour = (temps: number) => new Date(temps).setHours(0, 0, 0, 0);
    const ecartEnJours = Math.round((debutDuJour(maintenant) - debutDuJour(horodatage)) / UN_JOUR_MS);
    if (ecartEnJours === 0) return 'aujourd’hui';
    if (ecartEnJours === 1) return 'hier';
    return `le ${formaterDate(horodatage, maintenant)}`;
}
