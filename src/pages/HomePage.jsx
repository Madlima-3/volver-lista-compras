import { colors, fontSize } from '../theme';

export default function HomePage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Volver</h1>
      <p style={styles.subtitulo}>Início</p>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: colors.background },
  titulo:    { fontSize: fontSize['2xl'], color: colors.primary, margin: 0 },
  subtitulo: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: '8px' },
};
