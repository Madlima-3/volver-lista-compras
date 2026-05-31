// Página da lista de compras com checklist interativo.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fontSize, spacing, radius } from '../theme';
import {
  buscarListas,
  buscarItensDaLista,
  adicionarItem,
  marcarItem,
  deletarItem,
} from '../database/queries';

export default function ListPage() {
  const navigate = useNavigate();
  const [lista, setLista] = useState(null);
  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const inputRef = useRef(null);

  // Lê a lista mais recente e seus itens do localStorage
  function carregarDados() {
    const listas = buscarListas();
    if (listas.length > 0) {
      const mais_recente = listas[0];
      setLista(mais_recente);
      setItens(buscarItensDaLista(mais_recente.id));
    } else {
      setLista(null);
      setItens([]);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleAdicionar() {
    if (!novoItem.trim() || !lista) return;
    adicionarItem(lista.id, {
      name: novoItem.trim(),
      quantity: quantidade.trim() || null,
      unit: unidade.trim() || null,
    });
    setNovoItem('');
    setQuantidade('');
    setUnidade('');
    carregarDados();
    // Mantém o foco no campo de nome para adicionar vários itens seguidos
    inputRef.current?.focus();
  }

  function handleMarcar(itemId, estaMarcado) {
    // Inverte o estado: se estava marcado, desmarca; se não, marca
    marcarItem(itemId, !estaMarcado);
    carregarDados();
  }

  function handleDeletar(itemId) {
    deletarItem(itemId);
    carregarDados();
  }

  const itensMarcados = itens.filter((i) => i.checked === 1).length;
  const totalItens = itens.length;
  const progresso = totalItens > 0 ? (itensMarcados / totalItens) * 100 : 0;

  // ── Estado: nenhuma lista no banco ──
  if (!lista) {
    return (
      <div style={styles.telaVazia}>
        <span style={styles.emojiGrande}>🛒</span>
        <p style={styles.vazioTitulo}>Nenhuma lista criada</p>
        <p style={styles.vazioDetalhe}>Crie uma lista na página inicial para começar.</p>
        <button style={styles.botaoPrimario} onClick={() => navigate('/')}>
          Ir para o Início
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ── Cabeçalho ── */}
      <div style={styles.header}>
        <h2 style={styles.nomeLista}>{lista.name}</h2>
        <p style={styles.textoProgresso}>
          {totalItens === 0
            ? 'Lista vazia'
            : `${itensMarcados} de ${totalItens} ${totalItens === 1 ? 'item marcado' : 'itens marcados'}`}
        </p>
        {totalItens > 0 && (
          <div style={styles.barraFundo}>
            <div style={{ ...styles.barraProgresso, width: `${progresso}%` }} />
          </div>
        )}
      </div>

      {/* ── Área de itens (rolável) ── */}
      <div style={styles.listaArea}>
        {itens.length === 0 ? (
          <div style={styles.listaVazia}>
            <span style={styles.emojiGrande}>📝</span>
            <p style={styles.vazioDetalhe}>Adicione o primeiro item abaixo.</p>
          </div>
        ) : (
          itens.map((item) => {
            const marcado = item.checked === 1;
            return (
              <div key={item.id} style={styles.itemRow}>

                {/* Checkbox */}
                <button
                  style={{
                    ...styles.checkbox,
                    backgroundColor: marcado ? colors.primary : colors.surface,
                    borderColor: marcado ? colors.primary : colors.border,
                  }}
                  onClick={() => handleMarcar(item.id, marcado)}
                >
                  {marcado && <span style={styles.checkmark}>✓</span>}
                </button>

                {/* Nome do item */}
                <span
                  style={{
                    ...styles.itemNome,
                    color: marcado ? colors.textMuted : colors.textPrimary,
                    textDecoration: marcado ? 'line-through' : 'none',
                  }}
                >
                  {item.name}
                  {item.quantity && (
                    <span style={styles.itemQtd}>
                      {' '}· {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                    </span>
                  )}
                </span>

                {/* Botão deletar */}
                <button
                  style={styles.botaoDeletar}
                  onClick={() => handleDeletar(item.id)}
                >
                  ×
                </button>

              </div>
            );
          })
        )}
      </div>

      {/* ── Campo para adicionar item ── */}
      <div style={styles.inputArea}>
        {/* Linha 1: nome do item */}
        <input
          ref={inputRef}
          style={styles.input}
          placeholder="Nome do item..."
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
        />
        {/* Linha 2: quantidade, unidade e botão */}
        <div style={styles.inputLinha2}>
          <input
            style={styles.inputQtd}
            placeholder="Qtd"
            type="number"
            min="0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
          />
          <input
            style={styles.inputUnidade}
            placeholder="Unidade"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
          />
          <button
            style={{
              ...styles.botaoAdicionar,
              opacity: novoItem.trim() ? 1 : 0.4,
            }}
            onClick={handleAdicionar}
            disabled={!novoItem.trim()}
          >
            +
          </button>
        </div>
      </div>

    </div>
  );
}

const styles = {
  // ── Layout geral ──
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.background,
  },

  // ── Cabeçalho ──
  header: {
    padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
  },
  nomeLista: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    margin: 0,
  },
  textoProgresso: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: `${spacing.xs} 0 ${spacing.sm}`,
  },
  barraFundo: {
    width: '100%',
    height: '6px',
    backgroundColor: colors.borderMuted,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    transition: 'width 0.3s ease',
  },

  // ── Lista de itens ──
  listaArea: {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.sm} 0`,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.xl}`,
    borderBottom: `1px solid ${colors.borderMuted}`,
  },

  // ── Checkbox ──
  checkbox: {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    borderRadius: radius.sm,
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transition: 'background-color 0.15s, border-color 0.15s',
  },
  checkmark: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: '700',
    lineHeight: 1,
  },

  // ── Texto do item ──
  itemNome: {
    flex: 1,
    fontSize: fontSize.md,
    transition: 'color 0.15s',
  },
  itemQtd: {
    color: colors.textMuted,
    fontSize: fontSize.base,
  },

  // ── Botão deletar ──
  botaoDeletar: {
    background: 'none',
    border: 'none',
    color: colors.textDisabled,
    fontSize: '22px',
    lineHeight: 1,
    cursor: 'pointer',
    padding: `0 ${spacing.xs}`,
    display: 'flex',
    alignItems: 'center',
  },

  // ── Campo de adicionar ──
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
  },
  input: {
    width: '100%',
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.full,
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputLinha2: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
  },
  inputQtd: {
    width: '72px',
    minWidth: '72px',
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.full,
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    outline: 'none',
    textAlign: 'center',
  },
  inputUnidade: {
    flex: 1,
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.full,
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    outline: 'none',
  },
  botaoAdicionar: {
    width: '44px',
    height: '44px',
    minWidth: '44px',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    fontSize: fontSize.xl,
    fontWeight: '300',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    transition: 'opacity 0.15s',
  },

  // ── Estado vazio (sem lista) ──
  telaVazia: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  // ── Estado vazio (lista sem itens) ──
  listaVazia: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${spacing['2xl']} ${spacing.xl}`,
    gap: spacing.sm,
  },

  emojiGrande: {
    fontSize: '48px',
    lineHeight: 1,
  },
  vazioTitulo: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    margin: 0,
  },
  vazioDetalhe: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
    textAlign: 'center',
  },
  botaoPrimario: {
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.lg} ${spacing['2xl']}`,
    fontSize: fontSize.md,
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: spacing.sm,
  },
};
