import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Perfil</Text>
      <Text style={styles.subtitulo}>Em breve — Fase 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
