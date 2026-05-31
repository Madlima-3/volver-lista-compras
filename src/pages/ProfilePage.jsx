import { colors, fontSize } from '../theme';

export default function ProfilePage() {
  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Perfil</h2>
      <p style={styles.subtitulo}>Em breve — Fase 3</p>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: colors.background },
  titulo:    { fontSize: fontSize.xl, color: colors.textPrimary, margin: 0 },
  subtitulo: { fontSize: fontSize.base, color: colors.textMuted, marginTop: '8px' },
};
