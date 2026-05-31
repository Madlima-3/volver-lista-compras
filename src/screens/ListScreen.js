import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function ListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Compras</Text>
      <Text style={styles.subtitulo}>Em breve — Fase 2</Text>
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
