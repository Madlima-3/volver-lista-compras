// Configura toda a navegação do app.
// Layout com barra de abas na parte inferior.

import { NavLink, Outlet } from 'react-router-dom';
import { colors, fontSize } from '../theme';

const abas = [
  { path: '/',         label: 'Início',   icone: '🏠' },
  { path: '/receitas', label: 'Receitas', icone: '🍽️' },
  { path: '/lista',    label: 'Lista',    icone: '🛒' },
  { path: '/perfil',   label: 'Perfil',   icone: '👤' },
];

export default function Layout() {
  return (
    <div style={styles.root}>
      <main style={styles.main}>
        <Outlet />
      </main>
      <nav style={styles.tabBar}>
        {abas.map((aba) => (
          <NavLink
            key={aba.path}
            to={aba.path}
            end={aba.path === '/'}
            style={({ isActive }) => ({
              ...styles.aba,
              color: isActive ? colors.primary : colors.textDisabled,
            })}
          >
            <span style={styles.icone}>{aba.icone}</span>
            <span style={{ fontSize: fontSize.xs }}>{aba.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  root:   { display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: '480px', margin: '0 auto', backgroundColor: colors.background },
  main:   { flex: 1, overflow: 'auto' },
  tabBar: { display: 'flex', borderTop: `1px solid ${colors.border}`, backgroundColor: colors.surface, height: '60px' },
  aba:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', gap: '2px' },
  icone:  { fontSize: '20px' },
};
