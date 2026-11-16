/**
 * Charte graphique Lockspot (reprise de la maquette Figma).
 * Les noms de police correspondent aux clés chargées avec `useFonts` dans src/app/_layout.tsx.
 */
export const Brand = {
  colors: {
    background: '#eee6db',
    surface: '#fffdf9',
    surfaceSoft: '#f7f1e9',
    ink: '#1c2926',
    muted: '#6d7874',
    placeholder: '#9b9f9d',
    action: '#00b38b',
    actionDark: '#008f70',
    actionSoft: '#d9f3eb',
    line: '#dfd8ce',
    danger: '#be4b50',
    dangerSoft: '#f9e5e4',
  },
  fonts: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    semibold: 'DMSans_600SemiBold',
    bold: 'DMSans_700Bold',
    heading: 'Manrope_800ExtraBold',
  },
  radius: {
    sm: 14,
    md: 20,
    lg: 28,
  },
} as const;
