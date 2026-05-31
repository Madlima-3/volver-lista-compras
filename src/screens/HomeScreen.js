import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Volver</Text>
      <Text style={styles.subtitulo}>Início</Text>
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
    fontSize: typography.sizes['2xl'],
    color: colors.primary,
  },
  subtitulo: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
