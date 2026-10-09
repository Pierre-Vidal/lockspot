import type { ConfigContext, ExpoConfig } from 'expo/config';

const VARIANTS = {
  development: {
    name: 'Lockspot Dev',
    id: 'com.vadanero.lockspot.dev',
    scheme: 'lockspot-dev',
  },
  preview: {
    name: 'Lockspot Preview',
    id: 'com.vadanero.lockspot.preview',
    scheme: 'lockspot-preview',
  },
  production: {
    name: 'Lockspot',
    id: 'com.vadanero.lockspot',
    scheme: 'lockspot',
  },
} as const;

type Variant = keyof typeof VARIANTS;

const variant = (process.env.APP_VARIANT ?? 'production') as Variant;
const current = VARIANTS[variant] ?? VARIANTS.production;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: current.name,
  slug: 'lockspot',
  scheme: current.scheme,
  ios: { ...config.ios, bundleIdentifier: current.id },
  android: { ...config.android, package: current.id },
});