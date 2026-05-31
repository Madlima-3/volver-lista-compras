// Modo Supermercado — tela otimizada para usar na hora da compra.
// Fonte grande, checkboxes generosos, sem distrações de edição.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, fontSize, spacing, radius } from '../theme';
import { buscarListas, buscarItensDaLista, marcarItem, salvarLista } from '../database/queries';

export default function MarketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lista, setLista] = useState(null);
  const [itens, setItens] = useState([]);
  const [confirmarConclusao, setConfirmarConclusao] = useState(false);

  function carregarDados() {
    const listId = Number(id);
    const todas = buscarListas();
    const encontrada = todas.find((l) => l.id === listId);
    if (!encontrada) { navigate('/lista'); return; }
    setLista(encontrada);
    setItens(buscarItensDaLista(listId));
  }

  useEffect(() => { carregarDados(); }, [id]);

  function handleMarcar(itemId, estaMarcado) {
    marcarItem(itemId, !estaMarcado);
    carregarDados();
  }

  function handleConcluir() {
    salvarLista(lista.id);
    navigate('/lista');
  }

  if (!lista) return null;

  // Itens pendentes primeiro, marcados no final
  const pendentes = itens.filter((i) => i.checked === 0);
  const marcados  = itens.filter((i) => i.checked === 1);
  const total     = itens.length;
  const totalMarcados = marcados.length;
  const progresso = total > 0 ? (totalMarcados / total) * 100 : 0;
  const tudoMarcado = total > 0 && totalMarcados === total;

  return (
    <div style={styles.tela}>

      {/* ── Cabeçalho ── */}
      <div style={styles.header}>
        <button style={styles.botaoVoltar} onClick={() => navigate('/lista')}>
          ← Voltar
        </button>
        <div style={styles.headerCentro}>
          <p style={styles.headerLabel}>🛒 Modo Supermercado</p>
          <h2 style={styles.headerNome}>{lista.name}</h2>
        </div>
        <div style={styles.headerContador}>
          <span style={styles.contadorNumero}>{totalMarcados}</span>
          <span style={styles.contadorTotal}>/{total}</span>
        </div>
      </div>

      {/* ── Barra de progresso ── */}
      <div style={styles.barraFundo}>
        <div style={{
          ...styles.barraProgresso,
          width: `${progresso}%`,
          backgroundColor: tudoMarcado ? colors.primaryLight : colors.primary,
        }} />
      </div>

      {/* ── Lista de itens ── */}
      <div style={styles.listaArea}>

        {total === 0 ? (
          <div style={styles.vazioContainer}>
            <span style={styles.vazioEmoji}>📋</span>
            <p style={styles.vazioTexto}>Esta lista está vazia.</p>
          </div>
        ) : (
          <>
            {/* Itens pendentes */}
            {pendentes.map((item) => (
              <ItemMercado
                key={item.id}
                item={item}
                marcado={false}
                onMarcar={() => handleMarcar(item.id, false)}
              />
            ))}

            {/* Divisor quando há itens nos dois grupos */}
            {pendentes.length > 0 && marcados.length > 0 && (
              <div style={styles.divisorMarcados}>
                <span style={styles.divisorTexto}>✓ No carrinho ({totalMarcados})</span>
              </div>
            )}

            {/* Itens já marcados */}
            {marcados.map((item) => (
              <ItemMercado
                key={item.id}
                item={item}
                marcado={true}
                onMarcar={() => handleMarcar(item.id, true)}
              />
            ))}
          </>
        )}

        {/* Espaço extra para o botão flutuante não cobrir o último item */}
        <div style={{ height: '100px' }} />
      </div>

      {/* ── Botão flutuante de conclusão ── */}
      {total > 0 && (
        <div style={styles.rodapeFlutuante}>
          {tudoMarcado ? (
            <button style={styles.botaoConcluir} onClick={() => setConfirmarConclusao(true)}>
              ✅ Tudo no carrinho! Concluir compra
            </button>
          ) : (
            <button style={{ ...styles.botaoConcluir, ...styles.botaoConcluirParcial }}>
              {pendentes.length} {pendentes.length === 1 ? 'item restante' : 'itens restantes'}
            </button>
          )}
        </div>
      )}

      {/* ── Confirmação de conclusão ── */}
      {confirmarConclusao && (
        <div style={styles.overlay} onClick={() => setConfirmarConclusao(false)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <p style={styles.sheetTitulo}>Concluir compra?</p>
            <p style={styles.sheetDetalhe}>
              A lista será marcada como efetuada e você voltará para Minhas Listas.
            </p>
            <div style={styles.sheetBotoes}>
              <button style={styles.botaoCancelar} onClick={() => setConfirmarConclusao(false)}>
                Cancelar
              </button>
              <button style={styles.botaoConfirmar} onClick={handleConcluir}>
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Item individual — grande, fácil de tocar
// ─────────────────────────────────────────────

function ItemMercado({ item, marcado, onMarcar }) {
  return (
    <button style={{ ...styles.itemRow, opacity: marcado ? 0.45 : 1 }} onClick={onMarcar}>

      {/* Checkbox grande */}
      <div style={{
        ...styles.checkbox,
        backgroundColor: marcado ? colors.primary : colors.surface,
        borderColor:     marcado ? colors.primary : colors.border,
      }}>
        {marcado && <span style={styles.checkmark}>✓</span>}
      </div>

      {/* Nome e quantidade */}
      <div style={styles.itemTexto}>
        <span style={{
          ...styles.itemNome,
          textDecoration: marcado ? 'line-through' : 'none',
          color: marcado ? colors.textMuted : colors.textPrimary,
        }}>
          {item.name}
        </span>
        {item.quantity && (
          <span style={styles.itemQtd}>
            {item.quantity}{item.unit ? ` ${item.unit}` : ''}
          </span>
        )}
      </div>

    </button>
  );
}

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

const styles = {
  tela: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },

  // ── Cabeçalho ──
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: colors.primary,
    color: colors.surface,
  },
  botaoVoltar: {
    background: 'none',
    border: 'none',
    color: colors.surface,
    fontSize: fontSize.base,
    fontWeight: '600',
    cursor: 'pointer',
    padding: `${spacing.sm} 0`,
    whiteSpace: 'nowrap',
    opacity: 0.9,
  },
  headerCentro: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
  },
  headerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    margin: 0,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  headerNome: {
    fontSize: fontSize.md,
    fontWeight: '700',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  headerContador: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
    flexShrink: 0,
  },
  contadorNumero: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    lineHeight: 1,
  },
  contadorTotal: {
    fontSize: fontSize.lg,
    fontWeight: '400',
    opacity: 0.7,
  },

  // ── Barra de progresso (fina, logo abaixo do header) ──
  barraFundo: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(0,0,0,0.15)',
    flexShrink: 0,
  },
  barraProgresso: {
    height: '100%',
    transition: 'width 0.3s ease',
  },

  // ── Área de itens ──
  listaArea: {
    flex: 1,
    overflowY: 'auto',
  },
  itemRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
    padding: `${spacing.lg} ${spacing.xl}`,
    borderBottom: `1px solid ${colors.borderMuted}`,
    backgroundColor: colors.surface,
    border: 'none',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderMuted,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'opacity 0.2s',
  },

  // ── Checkbox grande ──
  checkbox: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    borderRadius: radius.md,
    border: '2.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.15s, border-color 0.15s',
  },
  checkmark: {
    color: colors.surface,
    fontSize: fontSize.lg,
    fontWeight: '700',
    lineHeight: 1,
  },

  // ── Texto do item ──
  itemTexto: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  itemNome: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    lineHeight: '1.3',
  },
  itemQtd: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Divisor entre pendentes e marcados ──
  divisorMarcados: {
    padding: `${spacing.sm} ${spacing.xl}`,
    backgroundColor: colors.borderMuted,
  },
  divisorTexto: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },

  // ── Estado vazio ──
  vazioContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing['2xl']} ${spacing.xl}`,
    gap: spacing.md,
  },
  vazioEmoji: { fontSize: '48px', lineHeight: 1 },
  vazioTexto: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    margin: 0,
  },

  // ── Botão flutuante ──
  rodapeFlutuante: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: `${spacing.md} ${spacing.xl} ${spacing['2xl']}`,
    background: `linear-gradient(to top, ${colors.background} 70%, transparent)`,
  },
  botaoConcluir: {
    width: '100%',
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.lg} ${spacing.xl}`,
    fontSize: fontSize.md,
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(15,110,86,0.35)',
  },
  botaoConcluirParcial: {
    backgroundColor: colors.surface,
    color: colors.textMuted,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'default',
  },

  // ── Sheet de confirmação ──
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: `${radius.xl} ${radius.xl} 0 0`,
    padding: spacing['2xl'],
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
  },
  sheetTitulo: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    margin: 0,
  },
  sheetDetalhe: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
    lineHeight: '1.5',
  },
  sheetBotoes: {
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
  botaoConfirmar: {
    flex: 1,
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.lg} ${spacing['2xl']}`,
    fontSize: fontSize.md,
    fontWeight: '700',
    cursor: 'pointer',
  },
};
