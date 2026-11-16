import Svg, { Circle, Path } from 'react-native-svg';

export type IconName = 'eye' | 'eyeOff';

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
};

/** Icônes de la maquette Figma (trait de 1,8 px, grille 24 x 24). */
export function Icon({ name, size = 22, color }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      {name === 'eye' ? (
        <>
          <Path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12" />
          <Circle cx={12} cy={12} r={2.5} />
        </>
      ) : (
        <Path d="m3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8M6.2 6.2C3.4 8.1 2 12 2 12s3.5 6 10 6c1 0 1.9-.1 2.7-.4" />
      )}
    </Svg>
  );
}
