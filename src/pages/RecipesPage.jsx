// Página de receitas — busca em cascata: base local → cache → Spoonacular → TheMealDB

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fontSize, spacing, radius } from '../theme';
import { buscarReceitas } from '../services/buscaOrquestrador';
import { extrairIngredientes } from '../services/spoonacularApi';
import { criarLista, adicionarItem } from '../database/queries';
import { db } from '../database/db';

// ─────────────────────────────────────────────
// Funções de coleção local (localStorage)
// ─────────────────────────────────────────────

function lerColecao() {
  try {
    return JSON.parse(localStorage.getItem(db.KEYS.recipes)) || [];
  } catch { return []; }
}

function salvarNaColecao(receita) {
  const colecao = lerColecao();
  // Evita duplicatas pelo id da Spoonacular
  if (colecao.some((r) => r.id === receita.id)) return;
  const atualizada = [{ ...receita, salva_em: new Date().toISOString() }, ...colecao];
  localStorage.setItem(db.KEYS.recipes, JSON.stringify(atualizada));
}

function removerDaColecao(id) {
  const atualizada = lerColecao().filter((r) => r.id !== id);
  localStorage.setItem(db.KEYS.recipes, JSON.stringify(atualizada));
}

// Agrupa ingredientes duplicados entre receitas
function agruparIngredientes(ingredientesPorReceita) {
  const mapa = {};
  Object.values(ingredientesPorReceita).forEach((lista) => {
    lista.forEach(({ name, quantity, unit }) => {
      const chave = name.toLowerCase().trim();
      if (mapa[chave]) {
        mapa[chave].ocorrencias++;
      } else {
        mapa[chave] = { name, quantity, unit, ocorrencias: 1 };
      }
    });
  });
  return Object.values(mapa).map(({ name, quantity, unit, ocorrencias }) => ({
    name,
    // Se aparece em mais de uma receita, indica as ocorrências
    quantity: ocorrencias > 1 ? `${ocorrencias}x` : (quantity || null),
    unit:     ocorrencias > 1 ? null : (unit || null),
  }));
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function RecipesPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [colecao, setColecao] = useState(lerColecao());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Receitas selecionadas para gerar lista
  const [selecionadas, setSelecionadas] = useState(new Map()); // id → receita completa
  const [ingredientesMap, setIngredientesMap] = useState({});  // id → [ingredientes]

  // Modal de detalhes
  const [receitaAberta, setReceitaAberta] = useState(null);

  // Modal para nomear a nova lista
  const [modalGerar, setModalGerar] = useState(false);
  const [nomeLista, setNomeLista] = useState('');

  const timerRef = useRef(null);

  // Busca com debounce de 600ms para não chamar a API a cada tecla
  useEffect(() => {
    if (!busca.trim()) { setResultados([]); setErro(null); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCarregando(true);
      setErro(null);
      buscarReceitas(busca)
        .then((res) => { setResultados(res); setCarregando(false); })
        .catch((e) => {
          setErro(`Não foi possível buscar. ${e.message || 'Verifique sua conexão.'}`);
          setCarregando(false);
        });
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [busca]);

  // Marca/desmarca uma receita para inclusão na lista
  function handleToggle(receita) {
    const id = receita.id;
    const nova = new Map(selecionadas);
    if (nova.has(id)) {
      nova.delete(id);
    } else {
      nova.set(id, receita);
      // Carrega ingredientes se ainda não tem
      if (!ingredientesMap[id]) {
        const ings = extrairIngredientes(receita);
        setIngredientesMap((prev) => ({ ...prev, [id]: ings }));
      }
    }
    setSelecionadas(nova);
  }

  // Salva receita na coleção local
  function handleSalvar(receita) {
    salvarNaColecao(receita);
    setColecao(lerColecao());
  }

  // Remove da coleção local
  function handleRemoverColecao(id) {
    removerDaColecao(id);
    setColecao(lerColecao());
  }

  // Abre o modal com nome sugerido antes de gerar a lista
  function handleAbrirModalGerar() {
    const nomes = [...selecionadas.values()].map((r) => r.title);
    if (nomes.length === 1) setNomeLista(nomes[0]);
    else if (nomes.length === 2) setNomeLista(`${nomes[0]} + ${nomes[1]}`);
    else setNomeLista(`${nomes[0]} e mais ${nomes.length - 1}`);
    setModalGerar(true);
  }

  // Cria a lista com os ingredientes agrupados
  function handleGerarLista() {
    if (!nomeLista.trim() || selecionadas.size === 0) return;

    // Garante que todos têm ingredientes carregados
    const mapa = { ...ingredientesMap };
    selecionadas.forEach((receita, id) => {
      if (!mapa[id]) mapa[id] = extrairIngredientes(receita);
    });

    const ingredientes = agruparIngredientes(mapa);
    const listId = criarLista(nomeLista.trim());
    ingredientes.forEach((ing) => adicionarItem(listId, ing));

    setModalGerar(false);
    navigate('/lista');
  }

  const colecaoIds = new Set(colecao.map((r) => r.id));

  return (
    <div style={styles.container}>

      {/* ── Cabeçalho fixo ── */}
      <div style={styles.header}>
        <h2 style={styles.titulo}>Receitas</h2>
        <div style={styles.campoBusca}>
          <span style={styles.iconeBusca}>🔍</span>
          <input
            style={styles.inputBusca}
            placeholder="Buscar receita (ex: frango, macarrão...)"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca.length > 0 && (
            <button style={styles.botaoLimpar} onClick={() => { setBusca(''); setResultados([]); }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Conteúdo rolável ── */}
      <div style={styles.conteudo}>

        {/* Estado de carregamento */}
        {carregando && (
          <p style={styles.estadoTexto}>Buscando receitas...</p>
        )}

        {/* Erro */}
        {erro && !carregando && (
          <p style={{ ...styles.estadoTexto, color: '#C0392B' }}>{erro}</p>
        )}

        {/* Resultados da busca */}
        {!carregando && resultados.length > 0 && (
          <>
            <p style={styles.secaoLabel}>Resultados da busca</p>
            {resultados.map((receita) => (
              <ReceitaCard
                key={receita.id}
                receita={receita}
                selecionada={selecionadas.has(receita.id)}
                salva={colecaoIds.has(receita.id)}
                onToggle={() => handleToggle(receita)}
                onSalvar={() => handleSalvar(receita)}
                onAbrirDetalhes={() => setReceitaAberta(receita)}
              />
            ))}
          </>
        )}

        {/* Sem resultados */}
        {!carregando && busca.trim() && resultados.length === 0 && !erro && (
          <p style={styles.estadoTexto}>Nenhuma receita encontrada para "{busca}".</p>
        )}

        {/* Coleção local */}
        {colecao.length > 0 && (
          <>
            <p style={styles.secaoLabel}>Minhas receitas salvas</p>
            {colecao.map((receita) => (
              <ReceitaCard
                key={receita.id}
                receita={receita}
                selecionada={selecionadas.has(receita.id)}
                salva={true}
                onToggle={() => handleToggle(receita)}
                onSalvar={() => handleRemoverColecao(receita.id)}
                labelSalvar="🗑️"
                onAbrirDetalhes={() => setReceitaAberta(receita)}
              />
            ))}
          </>
        )}

        {/* Estado inicial */}
        {!busca.trim() && colecao.length === 0 && (
          <div style={styles.estadoInicial}>
            <span style={styles.emojiGrande}>🍽️</span>
            <p style={styles.estadoTitulo}>Busque uma receita</p>
            <p style={styles.estadoDetalhe}>
              Digite o nome de um prato para encontrar receitas e gerar sua lista de compras automaticamente.
            </p>
          </div>
        )}

        {/* Espaço para o botão flutuante não cobrir o último item */}
        {selecionadas.size > 0 && <div style={{ height: '80px' }} />}

      </div>

      {/* ── Botão flutuante: gerar lista ── */}
      {selecionadas.size > 0 && (
        <div style={styles.rodapeFlutuante}>
          <button style={styles.botaoGerar} onClick={handleAbrirModalGerar}>
            🛒 Gerar lista · {selecionadas.size} {selecionadas.size === 1 ? 'receita' : 'receitas'}
          </button>
        </div>
      )}

      {/* ── Modal: detalhes da receita ── */}
      {receitaAberta && (
        <ReceitaModal
          receita={receitaAberta}
          selecionada={selecionadas.has(receitaAberta.id)}
          salva={colecaoIds.has(receitaAberta.id)}
          onToggle={() => handleToggle(receitaAberta)}
          onSalvar={() => handleSalvar(receitaAberta)}
          onRemover={() => handleRemoverColecao(receitaAberta.id)}
          onFechar={() => setReceitaAberta(null)}
        />
      )}

      {/* ── Modal: nomear a lista a gerar ── */}
      {modalGerar && (
        <div style={styles.overlay} onClick={() => setModalGerar(false)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.sheetTitulo}>Nome da lista</h2>
            <p style={styles.sheetDetalhe}>
              {selecionadas.size} {selecionadas.size === 1 ? 'receita selecionada' : 'receitas selecionadas'}
            </p>
            <input
              style={styles.inputModal}
              value={nomeLista}
              onChange={(e) => setNomeLista(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGerarLista()}
              autoFocus
            />
            <div style={styles.sheetBotoes}>
              <button style={styles.botaoCancelar} onClick={() => setModalGerar(false)}>
                Cancelar
              </button>
              <button
                style={{ ...styles.botaoConfirmar, opacity: nomeLista.trim() ? 1 : 0.5 }}
                onClick={handleGerarLista}
                disabled={!nomeLista.trim()}
              >
                Gerar lista
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Card compacto de receita
// ─────────────────────────────────────────────

function ReceitaCard({ receita, selecionada, salva, onToggle, onSalvar, onAbrirDetalhes, labelSalvar }) {
  const totalIngredientes = receita.extendedIngredients?.length
    || receita.usedIngredientCount + receita.missedIngredientCount
    || '?';

  const badgeFonte = { local: '🇧🇷', mealdb: '🌐', spoonacular: '🔍' }[receita.source] || '';

  return (
    <div style={{ ...styles.card, ...(selecionada ? styles.cardSelecionado : {}) }}>

      {/* Foto + info */}
      <button style={styles.cardConteudo} onClick={onAbrirDetalhes}>
        {receita.image ? (
          <img src={receita.image} alt={receita.title} style={styles.foto} />
        ) : (
          <div style={styles.fotoPlaceholder}>{badgeFonte || '🍽️'}</div>
        )}
        <div style={styles.cardTexto}>
          <p style={styles.cardNome}>{receita.title}</p>
          <p style={styles.cardMeta}>
            {badgeFonte} {receita.cuisines?.[0] || ''}
            {receita.readyInMinutes ? ` · ${receita.readyInMinutes} min` : ''}
            {` · ${totalIngredientes} ingredientes`}
          </p>
        </div>
      </button>

      {/* Ações */}
      <div style={styles.cardAcoes}>
        <button
          style={{ ...styles.botaoSalvar, ...(salva ? styles.botaoSalvoAtivo : {}) }}
          onClick={onSalvar}
          title={salva ? 'Remover da coleção' : 'Salvar na coleção'}
        >
          {labelSalvar || (salva ? '💾' : '🔖')}
        </button>
        <button
          style={{ ...styles.botaoSelecionar, ...(selecionada ? styles.botaoSelecionadoAtivo : {}) }}
          onClick={onToggle}
        >
          {selecionada ? '✓' : '+'}
        </button>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// Modal de detalhes da receita
// ─────────────────────────────────────────────

function ReceitaModal({ receita, selecionada, salva, onToggle, onSalvar, onRemover, onFechar }) {
  const ingredientes = extrairIngredientes(receita);

  return (
    <div style={styles.modalTela}>

      {/* Foto de capa */}
      {receita.image && (
        <div style={styles.modalFotoContainer}>
          <img src={receita.image} alt={receita.title} style={styles.modalFoto} />
          <button style={styles.modalBotaoFechar} onClick={onFechar}>✕</button>
        </div>
      )}

      {/* Conteúdo */}
      <div style={styles.modalConteudo}>
        <h2 style={styles.modalTitulo}>{receita.title}</h2>
        <p style={styles.modalMeta}>
          {receita.cuisines?.[0] || ''}
          {receita.readyInMinutes ? ` · ${receita.readyInMinutes} min` : ''}
          {receita.servings ? ` · ${receita.servings} porções` : ''}
        </p>

        {/* Ingredientes */}
        <p style={styles.secaoLabel}>Ingredientes ({ingredientes.length})</p>
        {ingredientes.length === 0 ? (
          <p style={styles.estadoTexto}>Ingredientes não disponíveis.</p>
        ) : (
          ingredientes.map((ing, i) => (
            <div key={i} style={styles.ingredienteRow}>
              <span style={styles.ingredienteNome}>{ing.name}</span>
              {(ing.quantity || ing.unit) && (
                <span style={styles.ingredienteMedida}>
                  {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Rodapé fixo */}
      <div style={styles.modalRodape}>
        <button
          style={{ ...styles.botaoRodape, ...(salva ? styles.botaoRodapeSalvoAtivo : {}) }}
          onClick={salva ? onRemover : onSalvar}
        >
          {salva ? '💾 Salva' : '🔖 Salvar'}
        </button>
        <button
          style={{ ...styles.botaoRodapePrimario, ...(selecionada ? styles.botaoRodapeSelecionadoAtivo : {}) }}
          onClick={() => { onToggle(); onFechar(); }}
        >
          {selecionada ? '✓ Selecionada' : '+ Selecionar para lista'}
        </button>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  header: {
    padding: `${spacing.xl} ${spacing.xl} ${spacing.md}`,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
  },
  titulo: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    margin: `0 0 ${spacing.md}`,
  },
  campoBusca: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.background,
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.full,
    padding: `0 ${spacing.lg}`,
    gap: spacing.sm,
  },
  iconeBusca: { fontSize: '16px', flexShrink: 0 },
  inputBusca: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: `${spacing.md} 0`,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    outline: 'none',
  },
  botaoLimpar: {
    background: 'none',
    border: 'none',
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: fontSize.base,
    padding: spacing.xs,
    lineHeight: 1,
  },

  conteudo: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.lg,
  },
  secaoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: `${spacing.md} 0 ${spacing.sm}`,
  },

  // ── Card de receita ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '2px solid transparent',
    transition: 'border-color 0.15s',
  },
  cardSelecionado: {
    borderColor: colors.primary,
  },
  cardConteudo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    padding: spacing.md,
    minWidth: 0,
  },
  foto: {
    width: '60px',
    height: '60px',
    borderRadius: radius.md,
    objectFit: 'cover',
    flexShrink: 0,
  },
  fotoPlaceholder: {
    width: '60px',
    height: '60px',
    borderRadius: radius.md,
    backgroundColor: colors.borderMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  },
  cardTexto: {
    flex: 1,
    minWidth: 0,
  },
  cardNome: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    margin: `${spacing.xs} 0 0`,
  },
  cardAcoes: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    padding: `${spacing.sm} ${spacing.md} ${spacing.sm} 0`,
  },
  botaoSalvar: {
    background: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSalvoAtivo: {
    backgroundColor: colors.amberPastel,
    borderColor: colors.amber,
  },
  botaoSelecionar: {
    width: '32px',
    height: '32px',
    borderRadius: radius.sm,
    border: `1.5px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSelecionadoAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.surface,
  },

  // ── Estados ──
  estadoInicial: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${spacing['2xl']} ${spacing.xl}`,
    gap: spacing.md,
    textAlign: 'center',
  },
  emojiGrande: { fontSize: '48px', lineHeight: 1 },
  estadoTitulo: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    margin: 0,
  },
  estadoDetalhe: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: 0,
    lineHeight: '1.5',
  },
  estadoTexto: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: `${spacing.xl} 0`,
    margin: 0,
  },

  // ── Botão flutuante ──
  rodapeFlutuante: {
    position: 'absolute',
    bottom: '60px',
    left: 0,
    right: 0,
    padding: `${spacing.sm} ${spacing.xl} ${spacing.md}`,
    background: `linear-gradient(to top, ${colors.background} 60%, transparent)`,
    pointerEvents: 'none',
  },
  botaoGerar: {
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
    pointerEvents: 'all',
  },

  // ── Modal fullscreen de detalhes ──
  modalTela: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  modalFotoContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  modalFoto: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    display: 'block',
  },
  modalBotaoFechar: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: '36px',
    height: '36px',
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConteudo: {
    flex: 1,
    padding: spacing.xl,
    paddingBottom: '100px',
  },
  modalTitulo: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    margin: 0,
  },
  modalMeta: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    margin: `${spacing.sm} 0 0`,
  },
  ingredienteRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.sm} 0`,
    borderBottom: `1px solid ${colors.borderMuted}`,
  },
  ingredienteNome: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  ingredienteMedida: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  modalRodape: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    gap: spacing.sm,
    padding: `${spacing.md} ${spacing.xl} ${spacing['2xl']}`,
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    zIndex: 51,
  },
  botaoRodape: {
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
  botaoRodapeSalvoAtivo: {
    backgroundColor: colors.amberPastel,
    color: colors.amber,
  },
  botaoRodapePrimario: {
    flex: 2,
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    borderRadius: radius.full,
    padding: spacing.md,
    fontSize: fontSize.base,
    fontWeight: '700',
    cursor: 'pointer',
  },
  botaoRodapeSelecionadoAtivo: {
    backgroundColor: colors.primaryLight,
  },

  // ── Sheet modal (gerar lista) ──
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
