// Tema central do app — todas as cores, fontes e espaçamentos ficam aqui.
// Nunca use valores de cor ou tamanho diretamente nas telas; sempre importe daqui.

export const colors = {
  background:    '#faf7f4',
  surface:       '#ffffff',
  border:        '#ece5dd',
  borderMuted:   '#f5f0eb',

  primary:       '#0F6E56',
  primaryLight:  '#1D9E75',
  primaryPastel: '#E1F5EE',

  amber:         '#854F0B',
  amberPastel:   '#FAEEDA',

  blue:          '#185FA5',
  bluePastel:    '#E6F1FB',

  pink:          '#993556',
  pinkPastel:    '#FBEAF0',

  textPrimary:   '#2c2420',
  textSecondary: '#8a7f74',
  textMuted:     '#b8a898',
  textDisabled:  '#d8cec4',
};

export const typography = {
  fontSans:  'DMSans',
  fontSerif: 'DMSerifDisplay',
  sizes: {
    xs:   10,
    sm:   11,
    base: 14,
    md:   15,
    lg:   18,
    xl:   22,
    '2xl': 28,
    '3xl': 34,
  },
  weights: {
    regular: '400',
    medium:  '500',
  },
};

export const spacing = {
  touchMin:   44,
  touchComfy: 64,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   18,
  full: 999,
};
