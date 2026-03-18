/**
 * Uygulama teması - tutarlı renk ve tipografi
 */
export const theme = {
  colors: {
    primary: '#5B4FFF',
    primaryLight: '#8B7EFF',
    secondary: '#00D9B5',
    accent: '#FF6B9D',
    gold: '#FFD700',
    background: '#0F0E17',
    surface: 'rgba(255,255,255,0.08)',
    surfaceBorder: 'rgba(255,255,255,0.12)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textMuted: 'rgba(255,255,255,0.5)',
    hunger: '#FF9A9E',
    happiness: '#A18CD1',
    success: '#6BCB77',
    warning: '#FFD93D',
    danger: '#FF6B6B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
  typography: {
    title: { fontSize: 28, fontWeight: '800' as const },
    subtitle: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '500' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 12, fontWeight: '400' as const },
  },
};
