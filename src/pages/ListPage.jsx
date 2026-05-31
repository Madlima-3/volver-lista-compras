// Página de listas de compras — histórico e lista ativa.

import { useState, useEffect, useRef } from 'react';
import { colors, fontSize, spacing, radius } from '../theme';
import {
  buscarListas,
  buscarItensDaLista,
  criarLista,
  salvarLista,
  ativarLista,
  duplicarLista,
  renomearLista,
  adicionarItem,
  marcarItem,
  deletarItem,
} from '../database/queries';

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function ListPage() {
  const [listas, setListas] = useState([]);
  const [itensMap, setItensMap] = useState({});
  const [modalNova, setModalNova] = useState(false);
  const [nomeNova, setNomeNova] = useState('');

  function recarregar() {
    const todas = buscarListas();
    setListas(todas);
    const mapa = {};
    todas.forEach((l) => { mapa[l.id] = buscarItensDaLista(l.id); });
    setItensMap(mapa);
  }

  useEffect(() => { recarregar(); }, []);

  function handleCriarLista() {
    if (!nomeNova.trim()) return;
    criarLista(nomeNova.trim());
    setNomeNova('');
    setModalNova(false);
    recarregar();
  }

  const ativas = listas.filter((l) => l.status === 'ativa');
  const efetuadas = listas.filter((l) => l.status === 'efetuada');

  return (
    <div style={styles.container}>

      {/* ── Cabeçalho da página ── */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitulo}>Minhas Listas</h2>
        <button style={styles.botaoNova} onClick={() => setModalNova(true)}>+ Nova</button>
      </div>

      {/* ── Conteúdo ── */}
      {listas.length === 0 ? (
        <div style={styles.telaVazia}>
          <span style={styles.emojiGrande}>🛒</span>
          <p style={styles.vazioTitulo}>Nenhuma lista ainda</p>
          <p style={styles.vazioDetalhe}>Crie sua primeira lista de compras.</p>
          <button style={styles.botaoPrimario} onClick={() => setModalNova(true)}>
            + Nova lista
          </button>
        </div>
      ) : (
        <div style={styles.conteudo}>

          {/* ── Listas ativas ── */}
          {ativas.length > 0 && (
            <>
              <p style={styles.secaoLabel}>Lista Ativa</p>
              {ativas.map((lista) => (
                <ListaAtivaCard
                  key={lista.id}
                  lista={lista}
                  itens={itensMap[lista.id] || []}
                  onAtualizar={recarregar}
                />
              ))}
            </>
          )}

          {/* ── Histórico ── */}
          {efetuadas.length > 0 && (
            <>
              <p style={styles.secaoLabel}>Histórico</p>
              {efetuadas.map((lista) => (
                <ListaEfetuadaCard
                  key={lista.id}
                  lista={lista}
                  itens={itensMap[lista.id] || []}
                  onAtualizar={recarregar}
                />
              ))}
            </>
          )}

        </div>
      )}

      {/* ── Modal: nova lista ── */}
      {modalNova && (
        <ModalTexto
          titulo="Nova lista"
          placeholder="Ex: Compras da semana"
          valor={nomeNova}
          onChange={setNomeNova}
          textoBotao="Criar"
          onConfirmar={handleCriarLista}
          onCancelar={() => { setModalNova(false); setNomeNova(''); }}
        />
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Card: lista ativa (com checklist e formulário)
// ─────────────────────────────────────────────

function ListaAtivaCard({ lista, itens, onAtualizar }) {
  const [novoItem, setNovoItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState(lista.name);
  const [modalDuplicar, setModalDuplicar] = useState(false);
  const [nomeDuplicar, setNomeDuplicar] = useState(`Cópia de ${lista.name}`);
  const inputRef = useRef(null);

  const marcados = itens.filter((i) => i.checked === 1).length;
  const total = itens.length;
  const progresso = total > 0 ? (marcados / total) * 100 : 0;

  function handleAdicionar() {
    if (!novoItem.trim()) return;
    adicionarItem(lista.id, {
      name: novoItem.trim(),
      quantity: quantidade.trim() || null,
      unit: unidade.trim() || null,
    });
    setNovoItem(''); setQuantidade(''); setUnidade('');
    onAtualizar();
    inputRef.current?.focus();
  }

  function handleRenomear() {
    if (!novoNome.trim()) return;
    renomearLista(lista.id, novoNome.trim());
    setEditandoNome(false);
    onAtualizar();
  }

  function handleDuplicar() {
    duplicarLista(lista.id, nomeDuplicar.trim() || `Cópia de ${lista.name}`);
    setModalDuplicar(false);
    onAtualizar();
  }

  return (
    <div style={styles.card}>

      {/* Badge de status */}
      <span style={styles.badgeAtiva}>🟢 Lista Ativa</span>

      {/* Nome da lista (com edição inline) */}
      {editandoNome ? (
        <div style={styles.editarNomeRow}>
          <input
            style={styles.inputNome}
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenomear()}
            autoFocus
          />
          <button style={styles.botaoIcone} onClick={handleRenomear}>✓</button>
          <button style={styles.botaoIcone} onClick={() => { setEditandoNome(false); setNovoNome(lista.name); }}>✕</button>
        </div>
      ) : (
        <div style={styles.nomeRow}>
          <h3 style={styles.nomeLista}>{lista.name}</h3>
          <button style={styles.botaoEditar} onClick={() => setEditandoNome(true)}>✏️</button>
        </div>
      )}

      {/* Progresso */}
      <p style={styles.textoProgresso}>
        {total === 0
          ? 'Lista vazia'
          : `${marcados} de ${total} ${total === 1 ? 'item marcado' : 'itens marcados'}`}
      </p>
      {total > 0 && (
        <div style={styles.barraFundo}>
          <div style={{ ...styles.barraProgresso, width: `${progresso}%` }} />
        </div>
      )}

      {/* Botões de ação */}
      <div style={styles.acoesRow}>
        <button style={styles.botaoSalvar} onClick={() => { salvarLista(lista.id); onAtualizar(); }}>
          ✅ Salvar lista
        </button>
        <button style={styles.botaoSecundario} onClick={() => setModalDuplicar(true)}>
          📋 Duplicar
        </button>
      </div>

      <div style={styles.divisor} />

      {/* Checklist */}
      {itens.length === 0 ? (
        <p style={styles.listaVaziaTexto}>Adicione o primeiro item abaixo.</p>
      ) : (
        itens.map((item) => {
          const marcado = item.checked === 1;
          return (
            <div key={item.id} style={styles.itemRow}>
              <button
                style={{
                  ...styles.checkbox,
                  backgroundColor: marcado ? colors.primary : colors.surface,
                  borderColor: marcado ? colors.primary : colors.border,
                }}
                onClick={() => { marcarItem(item.id, !marcado); onAtualizar(); }}
              >
                {marcado && <span style={styles.checkmark}>✓</span>}
              </button>
              <span style={{
                ...styles.itemNome,
                color: marcado ? colors.textMuted : colors.textPrimary,
                textDecoration: marcado ? 'line-through' : 'none',
              }}>
                {item.name}
                {item.quantity && (
                  <span style={styles.itemQtd}>
                    {' '}· {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                  </span>
                )}
              </span>
              <button style={styles.botaoDeletar} onClick={() => { deletarItem(item.id); onAtualizar(); }}>
                ×
              </button>
            </div>
          );
        })
      )}

      {/* Formulário de adicionar item */}
      <div style={styles.inputArea}>
        <input
          ref={inputRef}
          style={styles.input}
          placeholder="Nome do item..."
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
        />
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
            style={{ ...styles.botaoAdicionar, opacity: novoItem.trim() ? 1 : 0.4 }}
            onClick={handleAdicionar}
            disabled={!novoItem.trim()}
          >
            +
          </button>
        </div>
      </div>

      {/* Modal duplicar */}
      {modalDuplicar && (
        <ModalTexto
          titulo="Duplicar lista"
          placeholder="Nome da nova lista"
          valor={nomeDuplicar}
          onChange={setNomeDuplicar}
          textoBotao="Duplicar"
          onConfirmar={handleDuplicar}
          onCancelar={() => setModalDuplicar(false)}
        />
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Card: lista efetuada (colapsável)
// ─────────────────────────────────────────────

function ListaEfetuadaCard({ lista, itens, onAtualizar }) {
  const [expandida, setExpandida] = useState(false);
  const [modalDuplicar, setModalDuplicar] = useState(false);
  const [nomeDuplicar, setNomeDuplicar] = useState(`Cópia de ${lista.name}`);

  const total = itens.length;
  const dataReferencia = lista.completed_at || lista.created_at;
  const dataFormatada = new Date(dataReferencia).toLocaleDateString('pt-BR');

  function handleDuplicar() {
    duplicarLista(lista.id, nomeDuplicar.trim() || `Cópia de ${lista.name}`);
    setModalDuplicar(false);
    onAtualizar();
  }

  return (
    <div style={{ ...styles.card, ...styles.cardEfetuada }}>

      {/* Badge de status */}
      <span style={styles.badgeEfetuada}>✅ Lista Efetuada</span>

      {/* Nome e data */}
      <div style={styles.nomeRow}>
        <h3 style={{ ...styles.nomeLista, color: colors.textSecondary }}>{lista.name}</h3>
        <span style={styles.dataTexto}>{dataFormatada}</span>
      </div>

      <p style={styles.textoProgresso}>
        {total} {total === 1 ? 'item' : 'itens'}
      </p>

      {/* Ações */}
      <div style={styles.acoesRow}>
        <button style={styles.botaoSalvar} onClick={() => setModalDuplicar(true)}>
          📋 Duplicar
        </button>
        <button style={styles.botaoSecundario} onClick={() => { ativarLista(lista.id); onAtualizar(); }}>
          ↩️ Reativar
        </button>
        {total > 0 && (
          <button style={styles.botaoExpandir} onClick={() => setExpandida(!expandida)}>
            {expandida ? '▲' : '▼'} Itens
          </button>
        )}
      </div>

      {/* Itens expandidos (somente leitura) */}
      {expandida && (
        <>
          <div style={styles.divisor} />
          {itens.map((item) => (
            <div key={item.id} style={{ ...styles.itemRow, opacity: 0.65 }}>
              <span style={styles.checkboxLeitura}>
                {item.checked ? '✓' : '○'}
              </span>
              <span style={{
                ...styles.itemNome,
                color: colors.textSecondary,
                textDecoration: item.checked ? 'line-through' : 'none',
              }}>
                {item.name}
                {item.quantity && (
                  <span style={styles.itemQtd}>
                    {' '}· {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                  </span>
                )}
              </span>
            </div>
          ))}
        </>
      )}

      {/* Modal duplicar */}
      {modalDuplicar && (
        <ModalTexto
          titulo="Duplicar lista"
          placeholder="Nome da nova lista"
          valor={nomeDuplicar}
          onChange={setNomeDuplicar}
          textoBotao="Duplicar"
          onConfirmar={handleDuplicar}
          onCancelar={() => setModalDuplicar(false)}
        />
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Modal reutilizável com campo de texto
// ─────────────────────────────────────────────

function ModalTexto({ titulo, placeholder, valor, onChange, textoBotao, onConfirmar, onCancelar }) {
  return (
    <div style={styles.overlay} onClick={onCancelar}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitulo}>{titulo}</h2>
        <input
          style={styles.inputModal}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConfirmar()}
          autoFocus
        />
        <div style={styles.modalBotoes}>
          <button style={styles.botaoCancelar} onClick={onCancelar}>Cancelar</button>
          <button
            style={{ ...styles.botaoPrimario, opacity: valor.trim() ? 1 : 0.5 }}
            onClick={onConfirmar}
            disabled={!valor.trim()}
          >
            {textoBotao}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

const styles = {
  // ── Layout geral ──
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.background,
    overflowY: 'auto',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.xl} ${spacing.xl} ${spacing.md}`,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  pageTitulo: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    margin: 0,
  },
  botaoNova: {
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: fontSize.base,
    fontWeight: '600',
    cursor: 'pointer',
  },
  conteudo: {
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  secaoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: `${spacing.md} 0 ${spacing.sm}`,
  },

  // ── Cards ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardEfetuada: {
    backgroundColor: colors.borderMuted,
  },

  // ── Badges de status ──
  badgeAtiva: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryPastel,
    borderRadius: radius.full,
    padding: `2px ${spacing.sm}`,
    alignSelf: 'flex-start',
  },
  badgeEfetuada: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    padding: `2px ${spacing.sm}`,
    alignSelf: 'flex-start',
  },

  // ── Nome da lista ──
  nomeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nomeLista: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    margin: 0,
    flex: 1,
  },
  botaoEditar: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: spacing.xs,
    lineHeight: 1,
  },
  dataTexto: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // ── Edição inline do nome ──
  editarNomeRow: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
  },
  inputNome: {
    flex: 1,
    border: `1.5px solid ${colors.primary}`,
    borderRadius: radius.md,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    outline: 'none',
  },
  botaoIcone: {
    background: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: fontSize.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Progresso ──
  textoProgresso: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
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

  // ── Botões de ação ──
  acoesRow: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  botaoSalvar: {
    backgroundColor: colors.primaryPastel,
    color: colors.primary,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.sm,
    fontWeight: '600',
    cursor: 'pointer',
  },
  botaoSecundario: {
    backgroundColor: colors.borderMuted,
    color: colors.textSecondary,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.sm,
    fontWeight: '600',
    cursor: 'pointer',
  },
  botaoExpandir: {
    background: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.full,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    cursor: 'pointer',
  },

  // ── Divisor ──
  divisor: {
    borderTop: `1px solid ${colors.borderMuted}`,
    margin: `${spacing.xs} 0`,
  },

  // ── Texto lista vazia ──
  listaVaziaTexto: {
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: `${spacing.md} 0`,
    margin: 0,
  },

  // ── Itens do checklist ──
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.sm} 0`,
    borderBottom: `1px solid ${colors.borderMuted}`,
  },
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
  checkboxLeitura: {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  itemNome: {
    flex: 1,
    fontSize: fontSize.md,
    transition: 'color 0.15s',
  },
  itemQtd: {
    color: colors.textMuted,
    fontSize: fontSize.base,
  },
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

  // ── Formulário de adicionar item ──
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTop: `1px solid ${colors.borderMuted}`,
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
  inputModal: {
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
  botaoPrimario: {
    flex: 1,
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.lg} ${spacing['2xl']}`,
    fontSize: fontSize.md,
    fontWeight: '600',
    cursor: 'pointer',
  },

  // ── Tela vazia ──
  telaVazia: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  emojiGrande: { fontSize: '48px', lineHeight: 1 },
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
};
