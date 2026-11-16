import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, type TextInput } from 'react-native';

import { ErrorBanner } from '@/components/auth/error-banner';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { couleurs, polices } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { describeAuthError } from '@/services/auth-errors';
import { isValidEmail } from '@/utils/validation';

export function LoginForm() {
  const { signIn, resetPassword } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function clearErrors() {
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);
  }

  function showError(error: unknown) {
    const { field, message } = describeAuthError(error);
    if (field === 'email') setEmailError(message);
    else if (field === 'password') setPasswordError(message);
    else setFormError(message);
  }

  async function submit() {
    if (submitting) return;
    clearErrors();

    if (!isValidEmail(email)) {
      setEmailError('Entrez une adresse e-mail valide');
      return;
    }
    if (!password) {
      setPasswordError('Entrez votre mot de passe');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function forgotPassword() {
    clearErrors();
    if (!isValidEmail(email)) {
      setEmailError('Entrez votre e-mail pour réinitialiser le mot de passe');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert(
        'E-mail envoyé',
        'Si un compte existe pour cette adresse, vous allez recevoir un e-mail pour choisir un nouveau mot de passe.'
      );
    } catch (error) {
      showError(error);
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label="E-mail"
        placeholder="vous@exemple.fr"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          clearErrors();
        }}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Mot de passe"
        placeholder="Votre mot de passe"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearErrors();
        }}
        error={passwordError}
        secureTextEntry
        showPasswordToggle
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Pressable onPress={forgotPassword} hitSlop={8} accessibilityRole="button" style={styles.forgot}>
        <Text style={styles.forgotLabel}>Mot de passe oublié ?</Text>
      </Pressable>
      {formError ? <ErrorBanner message={formError} /> : null}
      <PrimaryButton label="Se connecter" onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -5,
  },
  forgotLabel: {
    fontFamily: polices.gras,
    fontSize: 12,
    color: couleurs.principaleFoncee,
  },
});
