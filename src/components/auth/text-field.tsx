import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/icons';
import { Brand } from '@/constants/brand';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  /** Affiche le bouton « œil » pour montrer / masquer le texte saisi. */
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
          placeholderTextColor={Brand.colors.placeholder}
          selectionColor={Brand.colors.action}
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
            <Icon name={revealed ? 'eyeOff' : 'eye'} color={Brand.colors.muted} />
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
    fontFamily: Brand.fonts.bold,
    fontSize: 12,
    color: Brand.colors.ink,
    paddingLeft: 2,
  },
  field: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Brand.radius.sm,
    borderWidth: 1,
    borderColor: Brand.colors.line,
    backgroundColor: 'rgba(255, 253, 249, 0.9)',
    overflow: 'hidden',
  },
  fieldFocused: {
    borderColor: Brand.colors.action,
    backgroundColor: Brand.colors.surface,
  },
  fieldError: {
    borderColor: Brand.colors.danger,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 51,
    paddingHorizontal: 15,
    fontFamily: Brand.fonts.regular,
    fontSize: 14,
    color: Brand.colors.ink,
  },
  toggle: {
    padding: 8,
    marginRight: 5,
  },
  error: {
    fontFamily: Brand.fonts.semibold,
    fontSize: 11,
    color: Brand.colors.danger,
    paddingLeft: 2,
  },
});
