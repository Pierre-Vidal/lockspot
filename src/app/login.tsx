import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Logo from '@/assets/images/logo.svg';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { couleurs, polices } from '@/constants/theme';

type Tab = 'login' | 'signup';

const TABS: readonly { key: Tab; label: string }[] = [
  { key: 'login', label: 'Se connecter' },
  { key: 'signup', label: 'Créer un compte' },
];

// Taille du logo, on garde ses proportions
const LOGO_WIDTH = 154;
const LOGO_HEIGHT = (LOGO_WIDTH * 564) / 2537;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('login');

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Logo width={LOGO_WIDTH} height={LOGO_HEIGHT} accessibilityLabel="Lockspot" />
          <Text style={styles.eyebrow}>Votre espace. Au bon endroit.</Text>
          <Text style={styles.title}>Vos documents restent là où ils sont en sécurité.</Text>

          <View style={styles.tabs} accessibilityRole="tablist">
            {TABS.map(({ key, label }) => {
              const active = tab === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.tab, active && styles.tabActive]}>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'login' ? <LoginForm /> : <SignupForm />}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  eyebrow: {
    marginTop: 20,
    marginBottom: 8,
    fontFamily: polices.gras,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: couleurs.principaleFoncee,
  },
  title: {
    maxWidth: 330,
    marginBottom: 26,
    fontFamily: polices.titre,
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.95,
    color: couleurs.texte,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: couleurs.surface,
    shadowColor: '#23302c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  tabLabel: {
    fontFamily: polices.gras,
    fontSize: 13,
    color: couleurs.texteSecondaire,
  },
  tabLabelActive: {
    color: couleurs.texte,
  },
});
