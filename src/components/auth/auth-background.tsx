import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

type GlowProps = {
  id: string;
  size: number;
  color: string;
  opacity: number;
  /** Fin du dégradé, de 0 à 1 (la couleur devient transparente à cette distance du centre). */
  fadeAt: number;
  position: ViewStyle;
};

function Glow({ id, size, color, opacity, fadeAt, position }: Readonly<GlowProps>) {
  return (
    <Svg width={size} height={size} style={[styles.glow, position]} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset={fadeAt} stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

/** Deux halos doux (vert en haut à droite, sable en bas à gauche) derrière le formulaire. */
export function AuthBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Glow
        id="auth-glow-green"
        size={270}
        color="#00b38b"
        opacity={0.11}
        fadeAt={0.68}
        position={{ right: -130, top: 30 }}
      />
      <Glow
        id="auth-glow-sand"
        size={220}
        color="#b5834e"
        opacity={0.08}
        fadeAt={0.7}
        position={{ left: -120, bottom: 60 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
});
