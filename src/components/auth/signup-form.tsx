import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { ErrorBanner } from '@/components/auth/error-banner';
import { PrimaryButton } from '@/components/auth/primary-button';
import { TextField } from '@/components/auth/text-field';
import { useAuth } from '@/hooks/use-auth';
import { describeAuthError } from '@/services/auth-errors';
import { isValidEmail, isValidUsername, PASSWORD_MIN_LENGTH } from '@/utils/validation';

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmation?: string;
};

export function SignupForm() {
  const { signUp } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function clearErrors() {
    setErrors({});
    setFormError(undefined);
  }

  function validate(): FieldErrors {
    const found: FieldErrors = {};
    if (!isValidUsername(username)) {
      found.username = '3 à 24 caractères : lettres, chiffres, . _ -';
    }
    if (!isValidEmail(email)) {
      found.email = 'Entrez une adresse e-mail valide';
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      found.password = `${PASSWORD_MIN_LENGTH} caractères minimum`;
    }
    if (confirmation !== password) {
      found.confirmation = 'Les mots de passe ne correspondent pas';
    }
    return found;
  }

  async function submit() {
    if (submitting) return;
    clearErrors();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    try {
      await signUp(username, email, password);
    } catch (error) {
      const { field, message } = describeAuthError(error);
      if (field === 'form') setFormError(message);
      else setErrors({ [field]: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Nom d’utilisateur"
        placeholder="ex. camille.d"
        value={username}
        onChangeText={(value) => {
          setUsername(value);
          clearErrors();
        }}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
        label="E-mail"
        placeholder="vous@exemple.fr"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          clearErrors();
        }}
        error={errors.email}
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
        placeholder={`${PASSWORD_MIN_LENGTH} caractères minimum`}
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearErrors();
        }}
        error={errors.password}
        secureTextEntry
        showPasswordToggle
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmationRef.current?.focus()}
      />
      <TextField
        ref={confirmationRef}
        label="Confirmation"
        placeholder="Confirmez votre mot de passe"
        value={confirmation}
        onChangeText={(value) => {
          setConfirmation(value);
          clearErrors();
        }}
        error={errors.confirmation}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {formError ? <ErrorBanner message={formError} /> : null}
      <PrimaryButton label="Créer mon compte" onPress={submit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
});
