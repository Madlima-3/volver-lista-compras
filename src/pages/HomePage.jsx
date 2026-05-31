// Página inicial do app — acesso rápido às principais funcionalidades.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fontSize, spacing, radius } from '../theme';
import { buscarListas, buscarItensDaLista, criarLista } from '../database/queries';

// Retorna saudação baseada no horário atual
function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomePage() {
  const navigate = useNavigate();

  // Lista mais recente salva no dispositivo
  const [listaAtiva, setListaAtiva] = useState(null);
  const [itens, setItens] = useState([]);

  // Controle do modal de nova lista
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeLista, setNomeLista] = useState('');

  // Carrega a lista mais recente ao abrir a página
  useEffect(() => {
    const listas = buscarListas();
    if (listas.length > 0) {
      const mais_recente = listas[0];
      setListaAtiva(mais_recente);
      setItens(buscarItensDaLista(mais_recente.id));
    }
  }, []);

  // Cria nova lista e navega para a página de lista
  function handleCriarLista() {
    if (!nomeLista.trim()) return;
    criarLista(nomeLista.trim());
    setModalAberto(false);
    setNomeLista('');
    navigate('/lista');
  }

  const itensMarcados = itens.filter((i) => i.checked === 1).length;
  const totalItens = itens.length;
  const progresso = totalItens > 0 ? (itensMarcados / totalItens) * 100 : 0;

  return (
    <div style={styles.container}>

      {/* ── Cabeçalho ── */}
      <div style={styles.header}>
        <h1 style={styles.titulo}>Volver</h1>
        <p style={styles.saudacao}>{saudacao()} 👋</p>
      </div>

      {/* ── Card: Lista ativa ── */}
      <button
        style={{ ...styles.card, ...styles.cardVerde }}
        onClick={() => listaAtiva && navigate('/lista')}
        disabled={!listaAtiva}
      >
        <div style={styles.cardTopo}>
          <span style={styles.cardIcone}>🛒</span>
          <span style={styles.cardRotulo}>Lista ativa</span>
        </div>

        {listaAtiva ? (
          <>
            <p style={styles.cardNome}>{listaAtiva.name}</p>
            <p style={styles.cardDetalhe}>
              {totalItens === 0
                ? 'Lista vazia — adicione itens'
                : `${itensMarcados} de ${totalItens} ${totalItens === 1 ? 'item marcado' : 'itens marcados'}`}
            </p>
            {totalItens > 0 && (
              <div style={styles.barraFundo}>
                <div style={{ ...styles.barraProgresso, width: `${progresso}%` }} />
              </div>
            )}
          </>
        ) : (
          <p style={styles.cardVazio}>Nenhuma lista criada ainda.</p>
        )}
      </button>

      {/* ── Card: Receitas ── */}
      <button
        style={{ ...styles.card, ...styles.cardAmbar }}
        onClick={() => navigate('/receitas')}
      >
        <div style={styles.cardTopo}>
          <span style={styles.cardIcone}>🍽️</span>
          <span style={styles.cardRotulo}>Receitas</span>
        </div>
        <p style={styles.cardNome}>Buscar receitas</p>
        <p style={styles.cardDetalhe}>Gere listas automaticamente</p>
      </button>

      {/* ── Botão principal ── */}
      <button style={styles.botaoPrimario} onClick={() => setModalAberto(true)}>
        + Nova lista
      </button>

      {/* ── Modal: criar nova lista ── */}
      {modalAberto && (
        <div style={styles.overlay} onClick={() => { setModalAberto(false); setNomeLista(''); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitulo}>Nova lista</h2>
            <p style={styles.modalDica}>Dê um nome para identificar a lista.</p>
            <input
              style={styles.input}
              placeholder="Ex: Compras da semana"
              value={nomeLista}
              onChange={(e) => setNomeLista(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCriarLista()}
              autoFocus
            />
            <div style={styles.modalBotoes}>
              <button
                style={styles.botaoCancelar}
                onClick={() => { setModalAberto(false); setNomeLista(''); }}
              >
                Cancelar
              </button>
              <button
                style={{
                  ...styles.botaoPrimario,
                  ...styles.botaoModal,
                  opacity: nomeLista.trim() ? 1 : 0.5,
                }}
                onClick={handleCriarLista}
                disabled={!nomeLista.trim()}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  // ── Layout geral ──
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
    minHeight: '100%',
  },

  // ── Cabeçalho ──
  header: {
    marginBottom: spacing.sm,
  },
  titulo: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.primary,
    margin: 0,
  },
  saudacao: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    margin: `${spacing.xs} 0 0`,
  },

  // ── Cards base ──
  card: {
    width: '100%',
    textAlign: 'left',
    border: 'none',
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardVerde: {
    backgroundColor: colors.primaryPastel,
  },
  cardAmbar: {
    backgroundColor: colors.amberPastel,
  },

  // ── Conteúdo dos cards ──
  cardTopo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardIcone: {
    fontSize: '20px',
  },
  cardRotulo: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardNome: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    margin: 0,
  },
  cardDetalhe: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
  },
  cardVazio: {
    fontSize: fontSize.base,
    color: colors.textMuted,
    margin: 0,
    fontStyle: 'italic',
  },

  // ── Barra de progresso ──
  barraFundo: {
    width: '100%',
    height: '6px',
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    transition: 'width 0.3s ease',
  },

  // ── Botão primário ──
  botaoPrimario: {
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.lg} ${spacing['2xl']}`,
    fontSize: fontSize.md,
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginTop: spacing.sm,
  },

  // ── Modal ──
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: `${radius.xl} ${radius.xl} 0 0`,
    padding: spacing['2xl'],
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
  },
  modalTitulo: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    margin: 0,
  },
  modalDica: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
  },
  input: {
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  modalBotoes: {
    display: 'flex',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  botaoCancelar: {
    flex: 1,
    backgroundColor: colors.borderMuted,
    color: colors.textSecondary,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.lg} ${spacing['2xl']}`,
    fontSize: fontSize.md,
    fontWeight: '600',
    cursor: 'pointer',
  },
  botaoModal: {
    flex: 1,
    width: 'auto',
    marginTop: 0,
  },
};
