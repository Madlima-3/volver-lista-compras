// Página de listas — visão compacta + modal de detalhe.

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
  deletarLista,
  alternarFixacao,
  adicionarItem,
  marcarItem,
  deletarItem,
} from '../database/queries';

// ─────────────────────────────────────────────
// Componente principal — relação de listas
// ─────────────────────────────────────────────

export default function ListPage() {
  const [listas, setListas] = useState([]);
  const [itensMap, setItensMap] = useState({});
  const [listaSelecionada, setListaSelecionada] = useState(null);
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

  // Ao fechar o modal, atualiza a lista selecionada com dados frescos
  function handleFecharModal() {
    recarregar();
    setListaSelecionada(null);
  }

  const ativas = listas.filter((l) => l.status === 'ativa');
  const efetuadas = listas.filter((l) => l.status === 'efetuada');

  return (
    <div style={styles.container}>

      {/* ── Cabeçalho ── */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitulo}>Minhas Listas</h2>
        <button style={styles.botaoNova} onClick={() => setModalNova(true)}>+ Nova</button>
      </div>

      {/* ── Relação de listas ── */}
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

          {ativas.length > 0 && (
            <>
              <p style={styles.secaoLabel}>Lista Ativa</p>
              {ativas.map((lista) => (
                <ListaCard
                  key={lista.id}
                  lista={lista}
                  itens={itensMap[lista.id] || []}
                  onClick={() => setListaSelecionada(lista)}
                />
              ))}
            </>
          )}

          {efetuadas.length > 0 && (
            <>
              <p style={styles.secaoLabel}>Histórico</p>
              {efetuadas.map((lista) => (
                <ListaCard
                  key={lista.id}
                  lista={lista}
                  itens={itensMap[lista.id] || []}
                  onClick={() => setListaSelecionada(lista)}
                />
              ))}
            </>
          )}

        </div>
      )}

      {/* ── Modal: detalhes da lista ── */}
      {listaSelecionada && (
        <ListaModal
          lista={listaSelecionada}
          itens={itensMap[listaSelecionada.id] || []}
          onFechar={handleFecharModal}
          onAtualizar={recarregar}
        />
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
// Card compacto na relação
// ─────────────────────────────────────────────

function ListaCard({ lista, itens, onClick }) {
  const isAtiva = lista.status === 'ativa';
  const marcados = itens.filter((i) => i.checked === 1).length;
  const total = itens.length;
  const progresso = total > 0 ? (marcados / total) * 100 : 0;
  const dataReferencia = lista.completed_at || lista.created_at;
  const dataFormatada = new Date(dataReferencia).toLocaleDateString('pt-BR');

  return (
    <button style={styles.card} onClick={onClick}>

      {/* Linha de topo: badge + data/pin */}
      <div style={styles.cardTopo}>
        <span style={isAtiva ? styles.badgeAtiva : styles.badgeEfetuada}>
          {isAtiva ? '🟢 Ativa' : '✅ Efetuada'}
        </span>
        <span style={styles.dataTexto}>
          {isAtiva && lista.pinned ? '📌 Fixada no Início' : (!isAtiva ? dataFormatada : '')}
        </span>
      </div>

      {/* Nome */}
      <p style={{
        ...styles.cardNome,
        color: isAtiva ? colors.textPrimary : colors.textSecondary,
      }}>
        {lista.name}
      </p>

      {/* Progresso (ativa) ou contagem (efetuada) */}
      {isAtiva ? (
        <>
          <p style={styles.cardProgresso}>
            {total === 0 ? 'Lista vazia' : `${marcados} de ${total} itens marcados`}
          </p>
          {total > 0 && (
            <div style={styles.barraFundo}>
              <div style={{ ...styles.barraProgresso, width: `${progresso}%` }} />
            </div>
          )}
        </>
      ) : (
        <p style={styles.cardProgresso}>
          {total} {total === 1 ? 'item' : 'itens'}
        </p>
      )}

    </button>
  );
}

// ─────────────────────────────────────────────
// Modal fullscreen: detalhes e edição da lista
// ─────────────────────────────────────────────

function ListaModal({ lista, itens, onFechar, onAtualizar }) {
  const [novoItem, setNovoItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState(lista.name);
  const [modalDuplicar, setModalDuplicar] = useState(false);
  const [nomeDuplicar, setNomeDuplicar] = useState(`Cópia de ${lista.name}`);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const inputRef = useRef(null);

  const isAtiva = lista.status === 'ativa';
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

  function handleEfetuar() {
    salvarLista(lista.id);
    onAtualizar();
    onFechar();
  }

  function handleReativar() {
    ativarLista(lista.id);
    onAtualizar();
    onFechar();
  }

  function handleDuplicar() {
    duplicarLista(lista.id, nomeDuplicar.trim() || `Cópia de ${lista.name}`);
    setModalDuplicar(false);
    onAtualizar();
    onFechar();
  }

  function handleExcluir() {
    deletarLista(lista.id);
    onAtualizar();
    onFechar();
  }

  function handleFixar() {
    alternarFixacao(lista.id);
    onAtualizar();
  }

  return (
    <div style={styles.modalTela}>

      {/* ── Cabeçalho do modal ── */}
      <div style={styles.modalHeader}>
        <button style={styles.botaoFechar} onClick={onFechar}>✕</button>

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
          <div style={styles.modalNomeRow}>
            <h3 style={styles.modalNome}>{lista.name}</h3>
            {isAtiva && (
              <button style={styles.botaoEditar} onClick={() => setEditandoNome(true)}>✏️</button>
            )}
          </div>
        )}

        {/* Botão excluir — sempre visível no canto direito do cabeçalho */}
        <button style={styles.botaoExcluir} onClick={() => setConfirmarExclusao(true)}>
          🗑️
        </button>
      </div>

      {/* ── Subtítulo com status, progresso e ações secundárias ── */}
      <div style={styles.modalSubheader}>
        <span style={isAtiva ? styles.badgeAtiva : styles.badgeEfetuada}>
          {isAtiva ? '🟢 Lista Ativa' : '✅ Lista Efetuada'}
        </span>
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

        {/* Ações secundárias: duplicar e fixar (ativas) */}
        <div style={styles.acoesSecundarias}>
          <button style={styles.botaoAcaoSecundaria} onClick={() => setModalDuplicar(true)}>
            📋 Duplicar
          </button>
          {isAtiva && (
            <button
              style={{
                ...styles.botaoAcaoSecundaria,
                ...(lista.pinned ? styles.botaoFixadoAtivo : {}),
              }}
              onClick={handleFixar}
            >
              {lista.pinned ? '📌 Fixada no Início' : '📌 Fixar no Início'}
            </button>
          )}
        </div>
      </div>

      {/* ── Lista de itens (rolável) ── */}
      <div style={styles.modalLista}>
        {itens.length === 0 ? (
          <p style={styles.listaVaziaTexto}>
            {isAtiva ? 'Adicione o primeiro item abaixo.' : 'Esta lista está vazia.'}
          </p>
        ) : (
          itens.map((item) => {
            const marcado = item.checked === 1;
            return (
              <div key={item.id} style={styles.itemRow}>
                {isAtiva ? (
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
                ) : (
                  <span style={styles.checkboxLeitura}>{marcado ? '✓' : '○'}</span>
                )}

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

                {isAtiva && (
                  <button style={styles.botaoDeletar} onClick={() => { deletarItem(item.id); onAtualizar(); }}>
                    ×
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* Formulário para adicionar item (somente em listas ativas) */}
        {isAtiva && (
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
        )}
      </div>

      {/* ── Rodapé com botões primários ── */}
      <div style={styles.modalRodape}>
        {isAtiva ? (
          <>
            <button style={styles.botaoEfetuar} onClick={handleEfetuar}>
              ✅ Efetuar
            </button>
            <button style={styles.botaoSalvar} onClick={onFechar}>
              Salvar
            </button>
          </>
        ) : (
          <>
            <button style={styles.botaoRodapeSecundario} onClick={handleReativar}>
              ↩️ Reativar
            </button>
            <button style={styles.botaoSalvar} onClick={onFechar}>
              Fechar
            </button>
          </>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmarExclusao && (
        <ModalConfirmacao
          mensagem={`Excluir "${lista.name}"? Esta ação não pode ser desfeita.`}
          textoBotao="Excluir"
          onConfirmar={handleExcluir}
          onCancelar={() => setConfirmarExclusao(false)}
        />
      )}

      {/* Modal de duplicar (sobreposto) */}
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
// Modal de confirmação (excluir, etc.)
// ─────────────────────────────────────────────

function ModalConfirmacao({ mensagem, textoBotao, onConfirmar, onCancelar }) {
  return (
    <div style={styles.overlay} onClick={onCancelar}>
      <div style={styles.sheetModal} onClick={(e) => e.stopPropagation()}>
        <p style={styles.confirmacaoMensagem}>{mensagem}</p>
        <div style={styles.sheetBotoes}>
          <button style={styles.botaoCancelar} onClick={onCancelar}>Cancelar</button>
          <button style={styles.botaoPerigo} onClick={onConfirmar}>{textoBotao}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Modal de texto reutilizável (criar / duplicar)
// ─────────────────────────────────────────────

function ModalTexto({ titulo, placeholder, valor, onChange, textoBotao, onConfirmar, onCancelar }) {
  return (
    <div style={styles.overlay} onClick={onCancelar}>
      <div style={styles.sheetModal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitulo}>{titulo}</h2>
        <input
          style={styles.inputModal}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConfirmar()}
          autoFocus
        />
        <div style={styles.sheetBotoes}>
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
    margin: `${spacing.md} 0 ${spacing.xs}`,
  },

  // ── Card compacto ──
  card: {
    width: '100%',
    textAlign: 'left',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNome: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    margin: 0,
  },
  cardProgresso: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
  },
  dataTexto: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // ── Badges ──
  badgeAtiva: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryPastel,
    borderRadius: radius.full,
    padding: `2px ${spacing.sm}`,
  },
  badgeEfetuada: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    padding: `2px ${spacing.sm}`,
  },

  // ── Barra de progresso ──
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

  // ── Ações secundárias no subheader ──
  acoesSecundarias: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  botaoAcaoSecundaria: {
    backgroundColor: colors.borderMuted,
    color: colors.textSecondary,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.sm,
    fontWeight: '600',
    cursor: 'pointer',
  },
  botaoFixadoAtivo: {
    backgroundColor: colors.primaryPastel,
    color: colors.primary,
  },
  botaoExcluir: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: spacing.xs,
    lineHeight: 1,
    marginLeft: 'auto',
    flexShrink: 0,
  },

  // ── Confirmação de exclusão ──
  confirmacaoMensagem: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    margin: 0,
    lineHeight: '1.5',
  },
  botaoPerigo: {
    flex: 1,
    backgroundColor: '#C0392B',
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: `${spacing.lg} ${spacing['2xl']}`,
    fontSize: fontSize.md,
    fontWeight: '600',
    cursor: 'pointer',
  },

  // ── Modal fullscreen ──
  modalTela: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.xl}`,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    minHeight: '60px',
  },
  botaoFechar: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: colors.textSecondary,
    padding: spacing.xs,
    lineHeight: 1,
    flexShrink: 0,
  },
  modalNomeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  modalNome: {
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
  editarNomeRow: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
    flex: 1,
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
  modalSubheader: {
    padding: `${spacing.md} ${spacing.xl}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    borderBottom: `1px solid ${colors.border}`,
  },
  textoProgresso: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
  },

  // ── Lista de itens no modal ──
  modalLista: {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.sm} ${spacing.xl}`,
  },
  listaVaziaTexto: {
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: `${spacing['2xl']} 0`,
    margin: 0,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} 0`,
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
    marginTop: spacing.lg,
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
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

  // ── Rodapé do modal ──
  modalRodape: {
    display: 'flex',
    gap: spacing.sm,
    padding: `${spacing.md} ${spacing.xl} ${spacing['2xl']}`,
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
  },
  botaoEfetuar: {
    flex: 1,
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: spacing.md,
    fontSize: fontSize.base,
    fontWeight: '700',
    cursor: 'pointer',
  },
  botaoRodapeSecundario: {
    flex: 1,
    backgroundColor: colors.borderMuted,
    color: colors.textSecondary,
    border: 'none',
    borderRadius: radius.full,
    padding: spacing.md,
    fontSize: fontSize.base,
    fontWeight: '600',
    cursor: 'pointer',
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: colors.primaryPastel,
    color: colors.primary,
    border: 'none',
    borderRadius: radius.full,
    padding: spacing.md,
    fontSize: fontSize.base,
    fontWeight: '700',
    cursor: 'pointer',
  },

  // ── Sheet modal (criar / duplicar) ──
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  sheetModal: {
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
