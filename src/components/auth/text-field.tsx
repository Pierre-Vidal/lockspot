import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icone } from '@/components/Icone';
import { arrondis, couleurs, polices } from '@/constants/theme';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  // Bouton « œil » pour afficher ou cacher le mot de passe
  showPasswordToggle?: boolean;
  ref?: Ref<TextInput>;
};

export function TextField({
  label,
  error,
  showPasswordToggle = false,
  secureTextEntry,
  ref,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hidden = Boolean(secureTextEntry) && !revealed;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused, error ? styles.fieldError : null]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={couleurs.texteDiscret}
          selectionColor={couleurs.principale}
          accessibilityLabel={label}
          secureTextEntry={hidden}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          {...inputProps}
        />
        {showPasswordToggle && (
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            style={styles.toggle}>
            <Icone nom={revealed ? 'oeilBarre' : 'oeil'} couleur={couleurs.texteSecondaire} taille={22} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7,
  },
  label: {
    fontFamily: polices.gras,
    fontSize: 12,
    color: couleurs.texte,
    paddingLeft: 2,
  },
  field: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: arrondis.md,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: 'rgba(255, 253, 249, 0.9)',
    overflow: 'hidden',
  },
  fieldFocused: {
    borderColor: couleurs.principale,
    backgroundColor: couleurs.surface,
  },
  fieldError: {
    borderColor: couleurs.erreur,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 51,
    paddingHorizontal: 15,
    fontFamily: polices.corps,
    fontSize: 14,
    color: couleurs.texte,
  },
  toggle: {
    padding: 8,
    marginRight: 5,
  },
  error: {
    fontFamily: polices.semiGras,
    fontSize: 11,
    color: couleurs.erreur,
    paddingLeft: 2,
  },
});
