export const couleurs = {
    fond: '#EEE6DB',
    surface: '#FEFBF7',
    texte: '#1C2926',
    texteSecondaire: '#6D7874',
    texteDiscret: '#929995',
    principale: '#00B38B',
    principaleFoncee: '#0E9577',
    principaleLegere: '#D9F3EB',
    marqueur: '#00BE63',
    attention: '#987035',
    bordure: '#E6E0D6',
    erreur: '#D64545',
} as const;

export const espacements = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const arrondis = { sm: 8, md: 16, lg: 24, pilule: 999 } as const;

export const typographie = {
    surtitre: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
    titre: { fontSize: 30, fontWeight: '800' },
    sousTitre: { fontSize: 18, fontWeight: '700' },
    corps: { fontSize: 15, fontWeight: '400' },
    legende: { fontSize: 12, fontWeight: '500' },
} as const;