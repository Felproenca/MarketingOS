import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  ExternalLink,
  FileText,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  LogOut,
  MessageCircle,
  Plus,
  Send,
  Settings2,
  Sparkles,
  Target,
  Users,
  Video,
  WandSparkles,
  X,
} from "lucide-react";
import {
  accessLink,
  agendaApprove,
  agendaCreate,
  agendaGenerate,
  agendaList,
  agendaReject,
  aiConnections,
  analyzeClient,
  beginConnection,
  clientAgendaDecide,
  clientPortal,
  clientReference,
  clients,
  connectionStatus,
  createClient,
  createClientRequest,
  createRequest,
  decideArtifact,
  hermesChat,
  login,
  logout,
  oauthLogin,
  operations,
  saveAIConnection,
  saveClientReference,
  sendInvite,
  session,
  syncClientData,
  uploadInput,
  type AIConnection,
  type Artifact,
  type Client,
  type ClientPortal,
  type Operation,
  type SocialConnection,
} from "./lib/api";

type View = "home" | "clients" | "produce" | "queue";
type WorkspaceData = {
  clients: Client[];
  requests: Operation[];
  jobs: any[];
  artifacts: Artifact[];
  systemStatus?: any;
};

const intents = [
  {
    type: "carousel",
    icon: <WandSparkles />,
    title: "Criar um carrossel",
    description: "Educar, gerar desejo ou levar alguém a agir.",
    prompt:
      "Crie um carrossel para Instagram com ideia central, gancho forte, progressão de slides, prova ou exemplo, CTA e copy pronta. Use o contexto do cliente e não invente fatos.",
    fields: ["tema", "audience", "cta"],
  },
  {
    type: "post",
    icon: <FileText />,
    title: "Criar uma publicação",
    description: "Uma peça pronta para publicar e aprovar.",
    prompt:
      "Crie uma publicação para Instagram com ângulo específico, legenda completa, CTA e hashtags coerentes. Conecte a mensagem à oferta e ao público do cliente.",
    fields: ["tema", "audience", "cta"],
  },
  {
    type: "strategy",
    icon: <Target />,
    title: "Decidir o próximo movimento",
    description: "Transforme um problema em plano de ação.",
    prompt:
      "Analise o contexto do cliente e entregue uma decisão recomendada, prioridades, riscos, hipóteses, plano de 7 dias e critérios objetivos de sucesso.",
    fields: ["problem", "audience"],
  },
  {
    type: "research",
    icon: <BarChart3 />,
    title: "Encontrar oportunidades",
    description: "Pesquisa com sinais, fontes e implicações práticas.",
    prompt:
      "Faça uma pesquisa estruturada sobre o tema, separe evidências de hipóteses, identifique oportunidades e traduza cada descoberta em uma ação de marketing.",
    fields: ["tema", "audience"],
  },
  {
    type: "analysis",
    icon: <Gauge />,
    title: "Entender os dados",
    description: "Descubra o que mudou e o que fazer agora.",
    prompt:
      "Analise os dados disponíveis, destaque mudanças e anomalias, explique causas prováveis, indique limitações e recomende os próximos testes.",
    fields: ["problem"],
  },
  {
    type: "design",
    icon: <LayoutTemplate />,
    title: "Construir site ou página",
    description:
      "Landing, identidade visual ou página premium para apresentar a marca.",
    prompt:
      "Crie a direção visual e estrutural de um site ou página premium: proposta de página, hierarquia, tipografia, paleta, seções, animações de entrada e copy principal. Entregue um plano executável, sem código.",
    fields: ["tema", "audience"],
  },
  {
    type: "video",
    icon: <Video />,
    title: "Editar um vídeo",
    description: "Cortes, legendas e versões para cada plataforma.",
    prompt:
      "Analise e edite o vídeo informado: corte os melhores momentos, ajuste ritmo, adicione legendas e entregue versões para as plataformas alvo. Não invente conteúdo que não esteja no vídeo.",
    fields: ["tema"],
  },
  {
    type: "image",
    icon: <ImageIcon />,
    title: "Criar uma imagem",
    description: "Gere um visual de apoio a partir de um prompt.",
    prompt:
      "Crie uma imagem a partir do prompt e do contexto do cliente. Use o provedor de imagem conectado.",
    fields: ["tema"],
  },
];

export default function App() {
  const path = window.location.pathname;
  const clientLogin = path === "/login/cliente";
  const slug =
    path.match(/^\/dados\/([^/]+)/)?.[1] ||
    (clientLogin
      ? new URLSearchParams(window.location.search).get("slug") || ""
      : "");
  const [auth, setAuth] = useState(!!session());
  if ((slug || clientLogin) && !auth)
    return <Login clientMode onDone={() => setAuth(true)} />;
  if (slug && auth) return <ClientPortalView slug={slug} />;
  if (!auth) return <Login onDone={() => setAuth(true)} />;
  return (
    <OperatorApp
      onLogout={() => {
        logout();
        setAuth(false);
      }}
    />
  );
}

function OperatorApp({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("home");
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [busy, setBusy] = useState(true);
  const [toast, setToast] = useState("");
  const [activeClient, setActiveClient] = useState("");
  async function refresh() {
    setBusy(true);
    try {
      const [ops, list] = await Promise.all([operations(), clients()]);
      setData({ ...ops, clients: list });
      if (!activeClient && list[0]) setActiveClient(list[0].client_id);
    } catch (error) {
      setToast((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const active = data?.clients.find(
    (client) => client.client_id === activeClient,
  );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            <b>MarketingOS</b>
            <small>OPERAÇÃO DE MARKETING</small>
          </div>
        </div>
        <div className="workspace-label">SEU CAMINHO</div>
        <Nav
          active={view}
          value="home"
          icon={<LayoutDashboard />}
          label="Hoje"
          set={setView}
        />
        <Nav
          active={view}
          value="clients"
          icon={<Users />}
          label="Clientes"
          set={setView}
        />
        <Nav
          active={view}
          value="produce"
          icon={<Sparkles />}
          label="Produzir"
          set={setView}
        />
        <Nav
          active={view}
          value="queue"
          icon={<ClipboardList />}
          label="Fila de trabalho"
          set={setView}
        />
        <div className="sidebar-bottom">
          <button className="nav-button">
            <Settings2 /> Configurações
          </button>
          <button className="nav-button" onClick={onLogout}>
            <LogOut /> Sair
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span className="crumb">
              MARKETINGOS <ChevronRight /> {viewLabel(view)}
            </span>
            {active && (
              <div className="active-context">
                <span className="context-dot" /> {active.display_name}
              </div>
            )}
          </div>
          <div className="top-actions">
            <span className="live-dot">Sistema online</span>
            <button className="icon-btn" onClick={() => void refresh()}>
              <span className={busy ? "spin" : ""}>↻</span>
            </button>
            <div className="avatar">FP</div>
          </div>
        </header>
        {toast && (
          <div className="toast">
            <CircleAlert /> {toast}
            <button onClick={() => setToast("")}>
              <X />
            </button>
          </div>
        )}
        {view === "clients" && (
          <ClientsView
            clients={data?.clients || []}
            refresh={refresh}
            onError={setToast}
          />
        )}
        {view === "produce" && (
          <ProduceView
            clients={data?.clients || []}
            activeClient={activeClient}
            setActiveClient={setActiveClient}
            onDone={() => {
              setView("queue");
              void refresh();
            }}
            onError={setToast}
          />
        )}
        {view === "queue" && (
          <QueueView data={data} refresh={refresh} onError={setToast} />
        )}
        {view === "home" && (
          <Home data={data} activeClient={active} go={setView} />
        )}
        <HermesChat mode="operator" />
      </main>
      <MobileNav active={view} set={setView} />
    </div>
  );
}

function MobileNav({
  active,
  set,
}: {
  active: View;
  set: (view: View) => void;
}) {
  return (
    <nav className="mobile-nav">
      <Nav
        active={active}
        value="home"
        icon={<LayoutDashboard />}
        label="Hoje"
        set={set}
      />
      <Nav
        active={active}
        value="clients"
        icon={<Users />}
        label="Clientes"
        set={set}
      />
      <Nav
        active={active}
        value="produce"
        icon={<Sparkles />}
        label="Produzir"
        set={set}
      />
      <Nav
        active={active}
        value="queue"
        icon={<ClipboardList />}
        label="Fila"
        set={set}
      />
    </nav>
  );
}

function Nav({
  active,
  value,
  icon,
  label,
  set,
}: {
  active: View;
  value: View;
  icon: ReactNode;
  label: string;
  set: (view: View) => void;
}) {
  return (
    <button
      className={"nav-button " + (active === value ? "active" : "")}
      onClick={() => set(value)}
    >
      {icon}
      <span>{label}</span>
      {value === "queue" && <ChevronRight className="nav-chevron" />}
    </button>
  );
}
function viewLabel(view: View) {
  return (
    {
      home: "HOJE",
      clients: "CLIENTES",
      produce: "PRODUZIR",
      queue: "FILA DE TRABALHO",
    } as Record<View, string>
  )[view];
}

function Home({
  data,
  activeClient,
  go,
}: {
  data: WorkspaceData | null;
  activeClient?: Client;
  go: (view: View) => void;
}) {
  const jobs = data?.jobs || [];
  const artifacts = data?.artifacts || [];
  const requests = data?.requests || [];
  const next = !data?.clients.length
    ? "Adicione seu primeiro cliente"
    : activeClient?.setup?.referenceReady === false
      ? "Complete o contexto da marca"
      : !activeClient?.sources?.length
        ? "Conecte os dados do cliente"
        : "Faça a primeira produção";
  return (
    <Page
      title="Bom trabalho, Felipe."
      intro="Um passo claro por vez. O que merece atenção agora?"
    >
      <section className="journey-card">
        <div className="journey-copy">
          <div className="eyebrow">PRÓXIMO PASSO</div>
          <h2>{next}</h2>
          <p>
            {!data?.clients.length
              ? "Cadastre uma empresa para começar a operar."
              : "O MarketingOS organiza o contexto antes de pedir qualquer produção."}
          </p>
          <button
            className="primary"
            onClick={() =>
              go(
                !data?.clients.length
                  ? "clients"
                  : activeClient?.setup?.referenceReady === false
                    ? "clients"
                    : "produce",
              )
            }
          >
            {!data?.clients.length ? "Adicionar cliente" : "Continuar"}{" "}
            <ArrowRight />
          </button>
        </div>
        <div className="journey-path">
          <PathStep
            done={Boolean(data?.clients.length)}
            number="1"
            label="Cliente"
          />
          <PathStep
            done={Boolean(activeClient?.setup?.referenceReady)}
            number="2"
            label="Contexto"
          />
          <PathStep
            done={Boolean(activeClient?.sources?.length)}
            number="3"
            label="Conexões"
          />
          <PathStep number="4" label="Produção" />
        </div>
      </section>
      <div className="metric-grid">
        <Metric
          label="Em andamento"
          value={
            jobs.filter((item) =>
              ["queued", "routed", "running"].includes(item.status),
            ).length
          }
          icon={<Activity />}
        />
        <Metric
          label="Para revisar"
          value={artifacts.filter((item) => item.status === "review").length}
          icon={<ClipboardList />}
        />
        <Metric
          label="Clientes ativos"
          value={data?.clients.length || 0}
          icon={<Users />}
        />
        <Metric
          label="Atenção necessária"
          value={
            jobs.filter((item) => ["blocked", "error"].includes(item.status))
              .length
          }
          icon={<CircleAlert />}
        />
      </div>
      <Panel
        title="Atividade recente"
        action={
          <button className="text-button" onClick={() => go("queue")}>
            Abrir fila <ArrowRight />
          </button>
        }
      >
        {requests.slice(0, 6).map((item) => (
          <div className="list-row" key={item.id}>
            <StatusDot status={item.status} />
            <div className="row-main">
              <b>{item.title}</b>
              <span>
                {item.client_id} · {item.request_type}
              </span>
            </div>
            <Status value={item.status} />
            <small>{formatDate(item.created_at)}</small>
          </div>
        ))}
        {!requests.length && (
          <Empty text="A fila está vazia. A primeira produção começa com um pedido guiado." />
        )}
      </Panel>
    </Page>
  );
}

function ClientsView({
  clients,
  refresh,
  onError,
}: {
  clients: Client[];
  refresh: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [selected, setSelected] = useState<Client | null>(clients[0] || null);
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    if (!selected && clients[0]) setSelected(clients[0]);
  }, [clients, selected]);
  return (
    <Page
      title="Clientes"
      intro="Cada cliente tem seu próprio contexto, conexões e fila de trabalho."
    >
      <div className="split-view">
        <section className="client-list">
          <div className="section-head">
            <div>
              <h3>Seus clientes</h3>
              <span>{clients.length} espaços</span>
            </div>
            <button
              className="primary small"
              onClick={() => {
                setSelected(null);
                setCreating(true);
              }}
            >
              <Plus /> Adicionar
            </button>
          </div>
          {clients.map((client) => (
            <button
              className={
                "client-item " +
                (selected?.client_id === client.client_id && !creating
                  ? "selected"
                  : "")
              }
              key={client.client_id}
              onClick={() => {
                setSelected(client);
                setCreating(false);
              }}
            >
              <div className="client-avatar">
                {initials(client.display_name)}
              </div>
              <div>
                <b>{client.display_name}</b>
                <span>{client.company_name || client.client_id}</span>
              </div>
              <SetupBadge client={client} />
            </button>
          ))}
          {!clients.length && (
            <Empty text="Nenhum cliente ainda. Adicione o primeiro espaço de operação." />
          )}
        </section>
        <section className="client-detail">
          {creating ? (
            <ClientWizard
              onSaved={async () => {
                setCreating(false);
                await refresh();
              }}
              onError={onError}
            />
          ) : selected ? (
            <ClientDetail
              client={selected}
              refresh={refresh}
              onError={onError}
            />
          ) : (
            <Empty text="Selecione um cliente para ver o espaço de operação." />
          )}
        </section>
      </div>
    </Page>
  );
}

function ClientWizard({
  onSaved,
  onError,
}: {
  onSaved: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    displayName: "",
    companyName: "",
    email: "",
    positioning: "",
    audience: "",
    visualDirection: "",
    tone: "",
    offers: "",
    constraints: "",
    approvedExamples: "",
  });
  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await createClient({ ...form, vocabulary: "" });
      await onSaved();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wizard">
      <div className="section-head">
        <div>
          <div className="eyebrow">NOVO ESPAÇO</div>
          <h2>Vamos preparar este cliente.</h2>
          <p className="muted">
            São três passos curtos. O sistema usa estas respostas para evitar
            conteúdo genérico.
          </p>
        </div>
      </div>
      <Stepper step={step} labels={["Identidade", "Contexto", "Acesso"]} />
      <form onSubmit={submit}>
        {step === 1 && (
          <>
            <Field
              label="Nome de exibição"
              hint="Como você quer reconhecer este cliente na operação."
              value={form.displayName}
              onChange={(value) => set("displayName", value)}
              placeholder="Ex.: Clínica Aurora"
              required
            />
            <Field
              label="Identificador"
              hint="Usado nas URLs; sem espaços ou acentos."
              value={form.clientId}
              onChange={(value) =>
                set(
                  "clientId",
                  value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
                )
              }
              placeholder="clinica-aurora"
              required
            />
            <Field
              label="Empresa"
              value={form.companyName}
              onChange={(value) => set("companyName", value)}
              placeholder="Nome comercial"
            />
          </>
        )}
        {step === 2 && (
          <>
            <Field
              label="O que este negócio faz e por que alguém escolhe ele?"
              value={form.positioning}
              onChange={(value) => set("positioning", value)}
              placeholder="Posicionamento em uma frase."
              required
            />
            <Field
              label="Quem é o público principal?"
              value={form.audience}
              onChange={(value) => set("audience", value)}
              placeholder="Pessoa, contexto e desejo."
              required
            />
            <Field
              label="Como a marca deve parecer?"
              value={form.visualDirection}
              onChange={(value) => set("visualDirection", value)}
              placeholder="Direção visual, referências, o que evitar."
              required
            />
            <Field
              label="Como a marca fala?"
              value={form.tone}
              onChange={(value) => set("tone", value)}
              placeholder="Ex.: direta, acolhedora, especialista."
              required
            />
            <Field
              label="Ofertas, produtos ou serviços"
              value={form.offers}
              onChange={(value) => set("offers", value)}
              placeholder="Um item por linha."
              required
              multiline
            />
            <Field
              label="Regras importantes"
              value={form.constraints}
              onChange={(value) => set("constraints", value)}
              placeholder="Um item por linha; fatos que não podem ser inventados."
              required
              multiline
            />
          </>
        )}
        {step === 3 && (
          <>
            <Field
              label="E-mail do cliente"
              hint="Envia um convite de acesso ao portal. Pode deixar para depois."
              value={form.email}
              onChange={(value) => set("email", value)}
              placeholder="cliente@empresa.com"
              type="email"
            />
            <div className="review-box">
              <CheckCircle2 />
              <div>
                <b>O que será criado</b>
                <span>
                  Espaço do cliente, contexto inicial, cota de uso e política de
                  aprovação.
                </span>
              </div>
            </div>
            <div className="form-actions">
              <button
                className="ghost"
                type="button"
                onClick={() => setStep(2)}
              >
                Voltar
              </button>
              <button className="primary" disabled={busy}>
                {busy ? "Preparando…" : "Criar espaço"} <Check />
              </button>
            </div>
          </>
        )}
        {step < 3 && (
          <div className="form-actions">
            <button
              className="ghost"
              type="button"
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
            >
              Voltar
            </button>
            <button
              className="primary"
              type="button"
              onClick={() => setStep(step + 1)}
            >
              Continuar <ArrowRight />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function ClientDetail({
  client,
  refresh,
  onError,
}: {
  client: Client;
  refresh: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [tab, setTab] = useState<
    "overview" | "context" | "connections" | "agenda"
  >("overview");
  const [connectionBusy, setConnectionBusy] = useState("");
  const [status, setStatus] = useState<Record<string, SocialConnection>>({});
  const [ai, setAi] = useState<AIConnection[]>([]);
  const [agenda, setAgenda] = useState<{ items: any[] } | null>(null);
  const [agendaBusy, setAgendaBusy] = useState("");
  const [linkBusy, setLinkBusy] = useState("");
  const [newAgenda, setNewAgenda] = useState({
    title: "",
    type: "carousel",
    objective: "",
    due_date: "",
    funnel_stage: "topo",
    channel: "instagram",
    cta: "",
  });
  async function loadAgenda() {
    try {
      setAgenda(await agendaList(client.client_id));
    } catch (error) {
      onError((error as Error).message);
    }
  }
  useEffect(() => {
    void aiConnections(client.client_id)
      .then(setAi)
      .catch((error) => onError((error as Error).message));
    if (tab === "agenda") void loadAgenda();
  }, [client.client_id]);
  async function addAgendaItems() {
    if (!newAgenda.title.trim()) return;
    setAgendaBusy("create");
    try {
      await agendaCreate(client.client_id, [
        {
          title: newAgenda.title.trim(),
          type: newAgenda.type,
          objective: newAgenda.objective.trim(),
          due_date: newAgenda.due_date || null,
          funnel_stage: newAgenda.funnel_stage,
          channel: newAgenda.channel,
          cta: newAgenda.cta.trim(),
        },
      ]);
      setNewAgenda({
        title: "",
        type: "carousel",
        objective: "",
        due_date: "",
        funnel_stage: "topo",
        channel: "instagram",
        cta: "",
      });
      await loadAgenda();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setAgendaBusy("");
    }
  }
  async function generateAgenda() {
    setAgendaBusy("generate");
    try {
      const res = await agendaGenerate(client.client_id);
      await loadAgenda();
      if (res.generated?.length)
        onError(
          `Agenda gerada: ${res.generated.length} solicitação(ões) na fila.`,
        );
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setAgendaBusy("");
    }
  }
  async function runAnalysis() {
    setAgendaBusy("analyze");
    try {
      const res = await analyzeClient(client.client_id);
      onError(res.message || "Análise enfileirada.");
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setAgendaBusy("");
    }
  }
  async function decideAgenda(id: string, approve: boolean) {
    setAgendaBusy(id);
    try {
      approve ? await agendaApprove([id]) : await agendaReject([id]);
      await loadAgenda();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setAgendaBusy("");
    }
  }
  async function sendInvitePrompt() { const email = window.prompt('E-mail do cliente para o convite:'); if (!email?.trim()) return; setLinkBusy('...'); try { const res = await sendInvite(client.client_id, email.trim()); onError(res.message || 'Convite enviado.') } catch (error) { onError((error as Error).message) } finally { setLinkBusy('') } }
  async function genAccessLink() {
    const email = window.prompt("E-mail do cliente para o link de acesso:");
    if (!email?.trim()) return;
    setLinkBusy("...");
    try {
      const res = await accessLink(client.client_id, email.trim());
      if (res.url) {
        navigator.clipboard?.writeText(res.url).catch(() => {});
        onError(`Link gerado e copiado! ${res.url}`);
      }
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setLinkBusy("");
    }
  }
  const connect = async (source: "meta" | "google") => {
    setConnectionBusy(source);
    try {
      const result = await beginConnection(client.client_id, source);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setConnectionBusy("");
    }
  };
  const check = async (source: "meta" | "google") => {
    try {
      const result = await connectionStatus(client.client_id, source);
      setStatus((current) => ({ ...current, [source]: result }));
    } catch (error) {
      onError((error as Error).message);
    }
  };
  return (
    <div className="detail-card">
      <div className="detail-title">
        <div className="client-avatar large">
          {initials(client.display_name)}
        </div>
        <div>
          <div className="eyebrow">
            {client.status === "onboarding" ? "EM PREPARAÇÃO" : "CLIENTE ATIVO"}
          </div>
          <h2>{client.display_name}</h2>
          <span className="muted">
            {client.company_name || client.client_id}
          </span>
        </div>
        <div className="detail-actions">
          <button
            className="ghost small"
            onClick={() => void genAccessLink()}
            disabled={Boolean(linkBusy)}
          >
            <Link2 /> {linkBusy ? "Gerando…" : "Link de acesso do cliente"}
          </button><button className="ghost small" onClick={() => void sendInvitePrompt()} disabled={Boolean(linkBusy)}><Send /> Enviar convite por e-mail</button>
        </div>
      </div>
      <div className="tabs">
        <button
          className={tab === "overview" ? "active" : ""}
          onClick={() => setTab("overview")}
        >
          Visão geral
        </button>
        <button
          className={tab === "context" ? "active" : ""}
          onClick={() => setTab("context")}
        >
          Contexto da marca
        </button>
        <button
          className={tab === "agenda" ? "active" : ""}
          onClick={() => {
            setTab("agenda");
            void loadAgenda();
          }}
        >
          Agenda
        </button>
        <button
          className={tab === "connections" ? "active" : ""}
          onClick={() => setTab("connections")}
        >
          Conexões
        </button>
      </div>
      {tab === "overview" && (
        <>
          <div className="setup-progress">
            <div>
              <b>Pronto para operar?</b>
              <span>{setupText(client)}</span>
            </div>
            <div className="progress-track">
              <span style={{ width: setupPercent(client) + "%" }} />
            </div>
            <strong>{setupPercent(client)}%</strong>
          </div>
          <div className="next-actions">
            <Action
              done={Boolean(client.setup?.referenceReady)}
              title="Contexto preenchido"
              description="Posicionamento, público, voz e regras."
            />
            <Action
              done={Boolean(client.sources?.length)}
              title="Dados conectados"
              description="Instagram e Google disponíveis."
            />
            <Action
              done={Boolean(client.members)}
              title="Acesso do cliente"
              description="Convite e membro do portal."
            />
          </div>
        </>
      )}
      {tab === "context" && (
        <ContextEditor client={client} onSaved={refresh} onError={onError} />
      )}
      {tab === "agenda" && (
        <div className="agenda-panel">
          <FunnelSummary agenda={agenda?.items || []} />
          <div className="agenda-create">
            <Field
              label="Novo item da agenda"
              value={newAgenda.title}
              onChange={(value) => setNewAgenda({ ...newAgenda, title: value })}
              placeholder="Ex.: Carrossel sobre rotina de skincare"
            />
            <div className="agenda-create-row">
              <select
                value={newAgenda.type}
                onChange={(event) =>
                  setNewAgenda({ ...newAgenda, type: event.target.value })
                }
                aria-label="Tipo"
              >
                <option value="carousel">Carrossel</option>
                <option value="post">Post</option>
                <option value="reel">Reel</option>
                <option value="video">Vídeo</option>
                <option value="design">Site/Página</option>
                <option value="strategy">Estratégia</option>
                <option value="research">Pesquisa</option>
                <option value="analysis">Análise</option>
              </select>
              <input
                value={newAgenda.objective}
                onChange={(event) =>
                  setNewAgenda({ ...newAgenda, objective: event.target.value })
                }
                placeholder="Objetivo (opcional)"
              />
            </div>
            <div className="agenda-create-row agenda-create-meta">
              <input
                type="date"
                value={newAgenda.due_date}
                onChange={(event) =>
                  setNewAgenda({ ...newAgenda, due_date: event.target.value })
                }
                aria-label="Data planejada"
              />
              <select
                value={newAgenda.funnel_stage}
                onChange={(event) =>
                  setNewAgenda({
                    ...newAgenda,
                    funnel_stage: event.target.value,
                  })
                }
                aria-label="Etapa do funil"
              >
                <option value="topo">Topo · descoberta</option>
                <option value="meio">Meio · consideração</option>
                <option value="fundo">Fundo · agendamento</option>
                <option value="retencao">Retenção · retorno</option>
              </select>
              <select
                value={newAgenda.channel}
                onChange={(event) =>
                  setNewAgenda({ ...newAgenda, channel: event.target.value })
                }
                aria-label="Canal"
              >
                <option value="instagram">Instagram</option>
                <option value="site">Site / SEO</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="multicanal">Multicanal</option>
              </select>
            </div>
            <input
              className="agenda-cta-input"
              value={newAgenda.cta}
              onChange={(event) =>
                setNewAgenda({ ...newAgenda, cta: event.target.value })
              }
              placeholder="CTA (ex.: agendar pelo WhatsApp)"
            />
            <div className="form-actions">
              <button
                className="primary small"
                disabled={agendaBusy === "create"}
                onClick={() => void addAgendaItems()}
              >
                {agendaBusy === "create"
                  ? "Adicionando…"
                  : "Adicionar à agenda"}{" "}
                <Plus />
              </button>
            </div>
          </div>
          <div className="agenda-list">
            {(agenda?.items || []).map((item) => (
              <div className="agenda-row" key={item.id}>
                <div>
                  <b>{item.title}</b>
                  <div className="agenda-meta">
                    <span
                      className={`funnel-chip ${item.funnel_stage || "topo"}`}
                    >
                      {stageLabel(item.funnel_stage)}
                    </span>
                    <span>{item.channel || "instagram"}</span>
                    <span>
                      {item.due_date
                        ? formatAgendaDate(item.due_date)
                        : "sem data"}
                    </span>
                    <span>{item.kpi || item.status}</span>
                  </div>
                  <span>{item.objective || "sem objetivo"}</span>
                  {item.cta && (
                    <small className="agenda-cta">CTA · {item.cta}</small>
                  )}
                </div>
                <div className="agenda-actions">
                  {item.status === "proposta" && (
                    <button
                      className="ghost small"
                      onClick={() => void decideAgenda(item.id, false)}
                      disabled={agendaBusy === item.id}
                    >
                      Recusar
                    </button>
                  )}
                  {item.status === "proposta" && (
                    <button
                      className="primary small"
                      onClick={() => void decideAgenda(item.id, true)}
                      disabled={agendaBusy === item.id}
                    >
                      Aprovar
                    </button>
                  )}
                  {item.status === "aprovado" && (
                    <span className="agenda-badge ok">Aguardando geração</span>
                  )}
                  {item.status === "gerado" && (
                    <a
                      className="text-button"
                      href={`/dados/${encodeURIComponent(client.client_id)}`}
                    >
                      Ver na fila <ArrowRight />
                    </a>
                  )}
                  {item.status === "recusado" && (
                    <span className="agenda-badge">Recusado pelo cliente</span>
                  )}
                </div>
              </div>
            ))}
            {!agenda?.items?.length && (
              <div className="empty">
                Nenhum item na agenda. Adicione o primeiro acima.
              </div>
            )}
          </div>
          <div className="form-actions">
            <button className="ghost" disabled={agendaBusy === 'analyze'} onClick={() => void runAnalysis()}>{agendaBusy === 'analyze' ? 'Analisando…' : 'Analisar dados e gerar pautas'} <Sparkles /></button><button
              className="primary"
              disabled={
                agendaBusy === "generate" ||
                !(agenda?.items || []).some(
                  (item) => item.status === "aprovado",
                )
              }
              onClick={() => void generateAgenda()}
            >
              {agendaBusy === "generate"
                ? "Gerando…"
                : "Gerar solicitações dos aprovados"}{" "}
              <ArrowRight />
            </button>
          </div>
        </div>
      )}
      {tab === "connections" && (
        <div className="connections-grid">
          <ConnectionCard
            icon={<span>◎</span>}
            title="Instagram e Meta"
            description="Insights, conta conectada e publicação após aprovação."
            source="meta"
            client={client}
            result={status.meta}
            busy={connectionBusy === "meta"}
            connect={connect}
            check={check}
          />
          <ConnectionCard
            icon={<span>▶</span>}
            title="Google, YouTube e Ads"
            description="Dados de canal, analytics e mídia do cliente."
            source="google"
            client={client}
            result={status.google}
            busy={connectionBusy === "google"}
            connect={connect}
            check={check}
          />
          <AIConnections
            clientId={client.client_id}
            connections={ai}
            onSaved={setAi}
            onError={onError}
          />
        </div>
      )}
    </div>
  );
}

function AIConnections({
  clientId,
  connections,
  onSaved,
  onError,
}: {
  clientId: string;
  connections: AIConnection[];
  onSaved: (value: AIConnection[]) => void;
  onError: (message: string) => void;
}) {
  const [provider, setProvider] = useState("deepseek");
  const [mode, setMode] = useState("api_key_customer");
  const [model, setModel] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveAIConnection({
        clientId,
        provider,
        executionMode: mode,
        model,
        secret,
      });
      setSecret("");
      onSaved(await aiConnections(clientId));
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="connection-card ai-connection-card">
      <div className="connection-icon">
        <Sparkles />
      </div>
      <div className="connection-copy">
        <b>Provedores de IA</b>
        <span>
          Configure o provedor usado pelo roteador deste cliente. A chave nao e
          exibida novamente.
        </span>
        {connections.length > 0 && (
          <div className="connection-status connected">
            <i />{" "}
            {connections
              .map((item) => item.provider + " · " + item.status)
              .join("  |  ")}
          </div>
        )}
        <form className="ai-connection-form" onSubmit={submit}>
          <div className="ai-fields">
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              aria-label="Provedor de IA"
            >
              <option value="deepseek">DeepSeek</option>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="qwen">Qwen</option>
              <option value="fal">Fal (vídeo/imagem)</option>
              <option value="kie">Kie (vídeo)</option>
              <option value="local">Local</option>
            </select>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              aria-label="Modo de execução"
            >
              <option value="api_key_customer">API key do cliente</option>
              <option value="platform_api">API da plataforma</option>
              <option value="local">Execução local</option>
            </select>
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Modelo padrão (opcional)"
              aria-label="Modelo padrão"
            />
            {mode === "api_key_customer" && (
              <input
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="Chave API"
                aria-label="Chave API"
                required
              />
            )}
          </div>
          <button className="primary small" disabled={busy}>
            {busy ? "Salvando…" : "Salvar conexão"} <Check />
          </button>
        </form>
      </div>
    </div>
  );
}
function ContextEditor({
  client,
  onSaved,
  onError,
}: {
  client: Client;
  onSaved: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    positioning: "",
    audience: "",
    visualDirection: "",
    tone: "",
    offers: "",
    constraints: "",
    approvedExamples: "",
  });
  useEffect(() => {
    void fetchReference();
  }, [client.client_id]);
  async function fetchReference() {
    try {
      const response = await clientReference(client.client_id);
      const r = response.reference || {};
      setForm({
        positioning: r.brand_profile?.positioning || "",
        audience: r.brand_profile?.audience || "",
        visualDirection: r.brand_profile?.visual_direction || "",
        tone: r.voice_profile?.tone || "",
        offers: (r.offers || []).join("\n"),
        constraints: (r.constraints || []).join("\n"),
        approvedExamples: (r.approved_examples || []).join("\n"),
      });
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveClientReference(client.client_id, form);
      await onSaved();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <div className="empty">Carregando contexto…</div>;
  return (
    <form className="context-form" onSubmit={submit}>
      <div className="callout">
        <Sparkles />
        <span>
          Este contexto é a memória de trabalho do cliente. Quanto mais
          concreto, menos genérica será a produção.
        </span>
      </div>
      <Field
        label="Posicionamento"
        value={form.positioning}
        onChange={(value) => setForm({ ...form, positioning: value })}
        required
      />
      <Field
        label="Público"
        value={form.audience}
        onChange={(value) => setForm({ ...form, audience: value })}
        required
      />
      <Field
        label="Direção visual"
        value={form.visualDirection}
        onChange={(value) => setForm({ ...form, visualDirection: value })}
        required
      />
      <Field
        label="Voz e tom"
        value={form.tone}
        onChange={(value) => setForm({ ...form, tone: value })}
        required
      />
      <Field
        label="Ofertas"
        value={form.offers}
        onChange={(value) => setForm({ ...form, offers: value })}
        multiline
        required
      />
      <Field
        label="Restrições"
        value={form.constraints}
        onChange={(value) => setForm({ ...form, constraints: value })}
        multiline
        required
      />
      <Field
        label="Exemplos aprovados"
        hint="Cole links ou descreva peças que representam o padrão."
        value={form.approvedExamples}
        onChange={(value) => setForm({ ...form, approvedExamples: value })}
        multiline
      />
      <button className="primary" disabled={busy}>
        {busy ? "Salvando…" : "Salvar contexto"} <Check />
      </button>
    </form>
  );
}

function ConnectionCard({
  icon,
  title,
  description,
  source,
  client,
  result,
  busy,
  connect,
  check,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  source: "meta" | "google";
  client: Client;
  result?: SocialConnection;
  busy: boolean;
  connect: (source: "meta" | "google") => Promise<void>;
  check: (source: "meta" | "google") => Promise<void>;
}) {
  const connected =
    result?.connected ||
    client.sources?.some(
      (item) =>
        item.source === source &&
        (!item.expiresAt || new Date(item.expiresAt) > new Date()),
    );
  return (
    <div className="connection-card">
      <div className="connection-icon">{icon}</div>
      <div className="connection-copy">
        <b>{title}</b>
        <span>{description}</span>
        <div
          className={
            connected ? "connection-status connected" : "connection-status"
          }
        >
          <i /> {connected ? "Conectado" : "Ainda não conectado"}
        </div>
      </div>
      <div className="connection-actions">
        <button className="ghost small" onClick={() => void check(source)}>
          Verificar
        </button>
        <button
          className="primary small"
          disabled={busy}
          onClick={() => void connect(source)}
        >
          {busy ? "Abrindo…" : connected ? "Reconectar" : "Conectar"} <Link2 />
        </button>
      </div>
    </div>
  );
}

function ProduceView({
  clients,
  activeClient,
  setActiveClient,
  onDone,
  onError,
}: {
  clients: Client[];
  activeClient: string;
  setActiveClient: (id: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const [intent, setIntent] = useState(intents[0]);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [audience, setAudience] = useState("");
  const [cta, setCta] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<{
    name: string;
    base64: string;
    type: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const client = clients.find((item) => item.client_id === activeClient);
  function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target.files?.[0];
    if (!input) return;
    const reader = new FileReader();
    reader.onload = () =>
      setFile({
        name: input.name,
        base64: String(reader.result || "").split(",")[1] || "",
        type: input.type || "video/mp4",
      });
    reader.readAsDataURL(input);
  }
  async function submit() {
    setBusy(true);
    try {
      const res = await createRequest({
        clientId: activeClient,
        title: title || intent.title,
        requestType: intent.type,
        objective: title || intent.title,
        prompt: [
          intent.prompt,
          "Tema ou problema: " + details,
          audience && "Público específico: " + audience,
          cta && "Ação desejada: " + cta,
        ]
          .filter(Boolean)
          .join("\n"),
        brief: details,
        audience,
        cta,
        requiresApproval: true,
      });
      if (file && res.mediaJob?.id) {
        setUploading(true);
        try {
          await uploadInput({
            clientId: activeClient,
            jobId: res.mediaJob.id,
            contentType: file.type,
            dataBase64: file.base64,
            fileName: file.name,
          });
          onError("Arquivo enviado para o editor.");
        } finally {
          setUploading(false);
        }
      }
      onDone();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title="Produzir"
      intro="Você escolhe o resultado. O sistema decide a rota, skill e executor."
    >
      <div className="production-layout">
        <div className="production-main">
          <div className="eyebrow">1 · ESCOLHA O RESULTADO</div>
          <h2>O que você quer colocar em movimento?</h2>
          <div className="intent-grid">
            {intents.map((item) => (
              <button
                className={
                  "intent-card " + (intent.type === item.type ? "selected" : "")
                }
                key={item.type}
                onClick={() => {
                  setIntent(item);
                  setStep(2);
                }}
              >
                <span className="intent-icon">{item.icon}</span>
                <b>{item.title}</b>
                <span>{item.description}</span>
                {intent.type === item.type && (
                  <CheckCircle2 className="intent-check" />
                )}
              </button>
            ))}
          </div>
          {step >= 2 && (
            <div className="guided-form">
              <div className="eyebrow">2 · DÊ CONTEXTO</div>
              <Field
                label="Cliente"
                value={activeClient}
                onChange={setActiveClient}
                select
                options={clients.map((item) => ({
                  value: item.client_id,
                  label: item.display_name,
                }))}
                required
              />
              <Field
                label="Como você chamaria este trabalho?"
                value={title}
                onChange={setTitle}
                placeholder={intent.title}
              />
              <Field
                label={
                  intent.fields.includes("problem")
                    ? "Qual problema precisa ser resolvido?"
                    : "Qual tema ou ideia deve guiar a produção?"
                }
                value={details}
                onChange={setDetails}
                placeholder="Escreva do seu jeito. O sistema organiza depois."
                multiline
                required
              />
              {intent.fields.includes("audience") && (
                <Field
                  label="Existe um público específico?"
                  value={audience}
                  onChange={setAudience}
                  placeholder="Opcional — deixe vazio para usar o público da marca."
                />
              )}
              {intent.fields.includes("cta") && (
                <Field
                  label="Qual ação você quer provocar?"
                  value={cta}
                  onChange={setCta}
                  placeholder="Ex.: chamar no WhatsApp, salvar, comprar, agendar"
                />
              )}
              {intent.type === "video" && (
                <div className="file-upload">
                  <label className="field">
                    <span>
                      Arquivo do vídeo <em> *</em>
                    </span>
                    {file ? (
                      <div className="file-picked">
                        <b>{file.name}</b>
                        <button type="button" onClick={() => setFile(null)}>
                          <X />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={pickFile}
                      />
                    )}
                  </label>
                  {uploading && (
                    <small className="muted">
                      Enviando arquivo para o editor…
                    </small>
                  )}
                </div>
              )}
            </div>
          )}
          {step >= 2 && (
            <div className="form-actions">
              <button className="ghost" onClick={() => setStep(1)}>
                Trocar resultado
              </button>
              <button
                className="primary"
                disabled={!activeClient || !details}
                onClick={() => setStep(3)}
              >
                Revisar pedido <ArrowRight />
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="confirm-box">
              <div className="eyebrow">3 · CONFIRME</div>
              <h3>{intent.title}</h3>
              <p>{details}</p>
              <div className="confirm-tags">
                <span>
                  <CheckCircle2 /> QA e aprovação antes de publicar
                </span>
                <span>
                  <span className="icon-glyph">◎</span> Publicação apenas após
                  aprovação
                </span>
              </div>
              <button
                className="primary wide"
                disabled={busy}
                onClick={() => void submit()}
              >
                {busy ? "Enviando para produção…" : "Enviar para produção"}{" "}
                <SendIcon />
              </button>
            </div>
          )}
        </div>
        <aside className="production-aside">
          <div className="aside-sticky">
            <div className="eyebrow">COMO FUNCIONA</div>
            <h3>Uma trilha, não um formulário.</h3>
            <PathStep done={step >= 1} number="1" label="Escolher resultado" />
            <PathStep done={step >= 2} number="2" label="Adicionar contexto" />
            <PathStep done={step >= 3} number="3" label="Revisar e enviar" />
            <div className="callout">
              <Sparkles />
              <span>
                O briefing recebe o contexto da marca e as referências do
                cliente antes de chegar à IA.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}

function SendIcon() {
  return <span className="icon-glyph">↗</span>;
}
function QueueView({
  data,
  refresh,
  onError,
}: {
  data: WorkspaceData | null;
  refresh: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState("");
  const rows = (data?.requests || []).filter(
    (item) => filter === "all" || item.status === filter,
  );
  const jobs = data?.jobs || [];
  const review = (data?.artifacts || []).filter(
    (item) => item.status === "review",
  );
  async function approve(item: Artifact) {
    try {
      await decideArtifact(item.id, "approved");
      await refresh();
    } catch (error) {
      onError((error as Error).message);
    }
  }
  async function requestChanges(item: Artifact) {
    const feedback = window.prompt(
      "Descreva o ajuste necessário para a próxima versão:",
    );
    if (feedback === null || !feedback.trim()) return;
    try {
      await decideArtifact(item.id, "changes_requested", feedback.trim());
      await refresh();
    } catch (error) {
      onError((error as Error).message);
    }
  }
  async function unblock(item: Operation) {
    const existing = (data?.requests || []).find(
      (r) =>
        r.client_id === item.client_id &&
        r.request_type === "strategy" &&
        ["queued", "routed", "running", "review", "awaiting_input"].includes(
          r.status,
        ) &&
        String(r.objective || "").includes(item.title),
    );
    if (existing) {
      setExpanded("");
      return;
    }
    try {
      await createRequest({
        clientId: item.client_id,
        title: "Decisão estratégica para desbloquear: " + item.title,
        requestType: "strategy",
        objective:
          "Gerar a decisão estratégica necessária para desbloquear o pedido: " +
          item.title,
        prompt:
          "Gere e registre a decisão estratégica do cliente para liberar o próximo conteúdo. Use o Client Truth e não invente fatos.",
      });
      setExpanded("");
      await refresh();
    } catch (error) {
      onError((error as Error).message);
    }
  }
  return (
    <Page
      title="Fila de trabalho"
      intro="Cada pedido mostra exatamente o que está acontecendo e qual é o próximo passo."
    >
      <div className="toolbar">
        <div className="filters">
          {[
            "all",
            "routed",
            "running",
            "review",
            "blocked",
            "error",
            "done",
          ].map((item) => (
            <button
              className={filter === item ? "chip active" : "chip"}
              key={item}
              onClick={() => setFilter(item)}
            >
              {item === "all" ? "Todos" : statusLabel(item)}
            </button>
          ))}
        </div>
        <button className="ghost" onClick={() => void refresh()}>
          ↻ Atualizar
        </button>
      </div>
      <div className="queue-layout">
        <Panel title="Pedidos">
          <div className="table-head">
            <span>Pedido</span>
            <span>Estado</span>
            <span>Quando</span>
          </div>
          {rows.map((item) => {
            const job = jobs.find((row) => row.request_id === item.id);
            const blocker =
              job?.error || job?.input?.context_gate?.errors?.[0] || "";
            const open = expanded === item.id;
            const strategyRequired = /strategy-decision|estrat[eé]gia/i.test(
              blocker,
            );
            return (
              <div className="queue-row-wrap" key={item.id}>
                <div className="table-row">
                  <div>
                    <b>{item.title}</b>
                    <small>
                      {item.client_id} · {item.request_type}
                    </small>
                    {blocker && (
                      <small className="blocker-label">
                        Atenção necessária
                      </small>
                    )}
                  </div>
                  <Status value={item.status} />
                  <small>{formatDate(item.created_at)}</small>
                  {blocker && (
                    <button
                      className="text-button blocker-toggle"
                      onClick={() => setExpanded(open ? "" : item.id)}
                    >
                      {open ? "Fechar motivo" : "Entender bloqueio"}
                    </button>
                  )}
                </div>
                {open && blocker && (
                  <div className="blocker-panel">
                    <b>Por que ficou bloqueado</b>
                    <span>{blocker}</span>
                    <small>
                      Solução:{" "}
                      {strategyRequired
                        ? "gere a decisão estratégica do cliente e depois reenvie o carrossel."
                        : "revise o pré-requisito indicado e reprocesse o pedido."}
                    </small>
                    {strategyRequired && (
                      <button
                        className="primary small"
                        onClick={() => void unblock(item)}
                      >
                        Gerar estratégia agora <ArrowRight />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!rows.length && <Empty text="Nenhum pedido neste estado." />}
        </Panel>
        <Panel title="Revisão humana">
          <div className="review-list">
            {review.map((item) => (
              <div className="review-item" key={item.id}>
                <div>
                  <b>{item.title}</b>
                  <span>
                    {item.artifact_type} · versão {item.current_version}
                  </span>
                </div>
                {item.preview_url && (
                  <a href={item.preview_url} target="_blank" rel="noreferrer">
                    <ExternalLink />
                  </a>
                )}
                <button
                  className="ghost small"
                  onClick={() => void requestChanges(item)}
                >
                  Pedir ajuste
                </button>
                <button
                  className="primary small"
                  onClick={() => void approve(item)}
                >
                  <Check /> Aprovar
                </button>
              </div>
            ))}
            {!review.length && <Empty text="Nada aguardando sua aprovação." />}
          </div>
        </Panel>
      </div>
    </Page>
  );
}

function ClientPortalView({ slug }: { slug: string }) {
  const [data, setData] = useState<ClientPortal | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  async function load() {
    setLoading(true);
    try {
      setData(await clientPortal(slug));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [slug]);
  async function connect(source: "meta" | "google") {
    setBusy(source);
    try {
      const result = await beginConnection(slug, source);
      window.location.href = result.url;
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function decide(
    id: string,
    decision: "approved" | "changes_requested",
  ) {
    const feedback =
      decision === "changes_requested"
        ? window.prompt("Descreva o ajuste necessário para a próxima versão:")
        : null;
    if (decision === "changes_requested" && !feedback?.trim()) return;
    try {
      await decideArtifact(id, decision, feedback ?? undefined);
      setError("");
      await load();
    } catch (error) {
      setError((error as Error).message);
    }
  }
  async function decideAgenda(id: string, approve: boolean) {
    try {
      await clientAgendaDecide(
        slug,
        approve ? "approve_agenda" : "reject_agenda",
        [id],
      );
      await load();
    } catch (error) {
      setError((error as Error).message);
    }
  }
  const needsSetup =
    data &&
    !loading &&
    !data.connections?.length &&
    !data.resultados_reais?.length;
  return (
    <div className="client-portal">
      <header className="portal-head">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            <b>MarketingOS</b>
            <small>ESPAÇO DO CLIENTE</small>
          </div>
        </div>
        <button
          className="ghost"
          onClick={() => {
            logout();
            window.location.reload();
          }}
        >
          <LogOut /> Sair
        </button>
      </header>
      <main className="portal-main">
        <div className="eyebrow">SEU ESPAÇO</div>
        <h1>{data?.display_name || "Seu marketing, em movimento."}</h1>
        <p className="muted">
          {needsSetup
            ? "Conecte seus canais para começar — é seguro e leva menos de um minuto."
            : "Envie um pedido, conecte seus dados e acompanhe o que está pronto."}
        </p>
        {loading && (
          <Panel title="Carregando espaço">
            <div className="empty">Buscando seus dados…</div>
          </Panel>
        )}
        {error && <div className="error">{error}</div>}
        {data && !loading && (
          <>
            {needsSetup && (
              <div className="portal-setup">
                <div className="setup-hero">
                  <div className="eyebrow">PRIMEIRO PASSO</div>
                  <h2>
                    Conecte seus dados.
                    <br />
                    <em>Nós cuidamos do resto.</em>
                  </h2>
                  <p>
                    O MarketingOS lê seus canais para entender o momento e
                    produzir conteúdo que conversa com a sua realidade.
                  </p>
                  <div className="setup-connect">
                    <button
                      className="primary"
                      disabled={busy === "meta"}
                      onClick={() => void connect("meta")}
                    >
                      <Link2 />{" "}
                      {busy === "meta" ? "Abrindo…" : "Conectar Instagram"}{" "}
                      <ArrowRight />
                    </button>
                    <button
                      className="ghost"
                      disabled={busy === "google"}
                      onClick={() => void connect("google")}
                    >
                      <Link2 />{" "}
                      {busy === "google"
                        ? "Abrindo…"
                        : "Conectar Google / YouTube"}{" "}
                      <ArrowRight />
                    </button>
                  </div>
                  <small className="setup-note">
                    Você autoriza cada conexão na própria plataforma. Nenhuma
                    senha é compartilhada.
                  </small>
                </div>
                <div className="setup-steps">
                  <PathStep number="1" label="Login seguro" done />
                  <PathStep number="2" label="Conectar Instagram e Google" />
                  <PathStep number="3" label="Receber suas entregas" />
                </div>
              </div>
            )}
            <ContentFunnelBoard
              agenda={data.agenda || []}
              insights={(data as any).insights_aquisicao}
              onDecision={decideAgenda}
            />
            {!needsSetup && (
              <>
                <div className="metric-grid">
                  <Metric
                    label="Entregas"
                    value={data.resultados_reais?.length || 0}
                    icon={<CheckCircle2 />}
                  />
                  <Metric
                    label="Próximos passos"
                    value={data.proximos_passos?.length || 0}
                    icon={<Activity />}
                  />
                  <Metric
                    label="Conexões"
                    value={data.connections?.length || 0}
                    icon={<Link2 />}
                  />
                </div>
                {data.analise && <Panel title="Análise dos seus dados"><div className="analise-block"><p className="muted">{data.analise.resumo || 'Leitura dos seus dados coletados.'}</p><div className="insight-grid">{(data.analise.insights || []).map((item: any, index: number) => <div key={index}><b className={'insight-tipo ' + item.tipo}>{String(item.tipo || 'insight').toUpperCase()}</b><span><strong>{item.titulo}</strong></span><small>{item.detalhe}</small>{item.evidencia && <small className="insight-evidencia">Evidência: {item.evidencia}</small>}</div>)}</div>{data.analise.recomendacoes?.length > 0 && <div className="recomendacoes"><b>Recomendações</b>{(data.analise.recomendacoes || []).map((r: string, i: number) => <span key={i}>{r}</span>)}</div>}{data.analise.preview_url && <a className="text-button" href={data.analise.preview_url} target="_blank" rel="noreferrer">Ler relatório completo <ExternalLink /></a>}</div></Panel>}
                {!data.analise && (data.connections || []).length > 0 && <Panel title="Análise dos seus dados"><div className="empty">A equipe ainda não gerou a análise. Assim que os dados forem suficientes, o relatório com insights e sugestões aparecerá aqui.</div></Panel>}
                <div className="portal-grid">
                  <Panel title="Resultados">
                    {(data.resultados_reais || []).map((item: any) => (
                      <div className="list-row" key={item.id}>
                        <StatusDot status={item.status} />
                        <div className="row-main">
                          <b>{item.titulo}</b>
                          <span>
                            {item.tipo} · {formatDate(item.criado_em)}
                          </span>
                          {item.preview_url && (
                            <a
                              className="text-button"
                              href={item.preview_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Abrir resultado <ExternalLink />
                            </a>
                          )}
                        </div>
                        <Status value={item.status} />
                        {item.status === "review" && (
                          <div className="portal-actions">
                            <button
                              className="ghost small"
                              onClick={() =>
                                void decide(item.id, "changes_requested")
                              }
                            >
                              Pedir ajuste
                            </button>
                            <button
                              className="primary small"
                              onClick={() => void decide(item.id, "approved")}
                            >
                              <Check /> Aprovar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {!data.resultados_reais?.length && (
                      <Empty text="As primeiras entregas aparecerão aqui." />
                    )}
                  </Panel>
                  <ConnectionSummary
                    clientId={slug}
                    connections={data.connections || []}
                    onSynced={load}
                  />
                  <ClientAISetup clientId={slug} />
                  <AcquisitionInsights
                    data={(data as any).insights_aquisicao}
                  />
                  <Panel title="Próximos passos">
                    {(data.proximos_passos || []).map((item: any) => (
                      <div className="list-row" key={item.titulo}>
                        <StatusDot status={item.status} />
                        <div className="row-main">
                          <b>{item.titulo}</b>
                          <span>{item.capability || "Em produção"}</span>
                        </div>
                        <Status value={item.status} />
                      </div>
                    ))}
                    {!data.proximos_passos?.length && (
                      <Empty text="Tudo em dia por enquanto." />
                    )}
                  </Panel>
                </div>
                <ClientRequestForm slug={slug} />
                <HermesChat mode="client" clientId={slug} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const funnelStages = [
  { id: "topo", label: "Descoberta", intent: "Alcance e identificação" },
  { id: "meio", label: "Consideração", intent: "Confiança e desejo" },
  { id: "fundo", label: "Agendamento", intent: "Conversa no WhatsApp" },
  { id: "retencao", label: "Retorno", intent: "Manutenção e recorrência" },
];

function stageLabel(stage?: string) {
  return funnelStages.find((item) => item.id === stage)?.label || "Descoberta";
}

function formatAgendaDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function FunnelSummary({ agenda }: { agenda: any[] }) {
  return (
    <div className="funnel-summary">
      {funnelStages.map((stage) => {
        const count = agenda.filter(
          (item) =>
            (item.funnel_stage || item.etapa_funil || "topo") === stage.id,
        ).length;
        return (
          <div className={`funnel-step ${stage.id}`} key={stage.id}>
            <span>{count}</span>
            <div>
              <b>{stage.label}</b>
              <small>{stage.intent}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContentFunnelBoard({
  agenda,
  insights,
  onDecision,
}: {
  agenda: any[];
  insights?: any;
  onDecision: (id: string, approve: boolean) => Promise<void>;
}) {
  const ordered = [...agenda].sort((a, b) =>
    String(a.data || a.due_date || "9999").localeCompare(
      String(b.data || b.due_date || "9999"),
    ),
  );
  const instagramRecords = insights?.instagram?.records || 0;
  const youtubeRecords = insights?.youtube?.records || 0;
  return (
    <section className="funnel-board">
      <div className="funnel-board-head">
        <div>
          <div className="eyebrow">PLANO DE 90 DIAS</div>
          <h2>Conteúdo que conduz até o agendamento.</h2>
          <p>
            Instagram gera descoberta e desejo. O site aprofunda a decisão com
            SEO. O WhatsApp recebe a intenção pronta para conversar.
          </p>
        </div>
        <div className="data-signal">
          <span className={instagramRecords ? "connected" : ""} />
          <div>
            <b>{instagramRecords + youtubeRecords} sinais coletados</b>
            <small>
              {instagramRecords + youtubeRecords
                ? "Agenda e métricas reais no mesmo painel"
                : "A agenda está pronta; os dados entram após a conexão"}
            </small>
          </div>
        </div>
      </div>
      <FunnelSummary agenda={agenda} />
      <div className="calendar-head">
        <div>
          <CalendarDays />
          <div>
            <b>Agenda editorial</b>
            <span>{agenda.length} entregas planejadas</span>
          </div>
        </div>
        <span>Instagram + Site / SEO</span>
      </div>
      <div className="funnel-calendar">
        {ordered.map((item) => {
          const stage = item.etapa_funil || item.funnel_stage || "topo";
          const date = item.data || item.due_date;
          return (
            <article className="calendar-item" key={item.id}>
              <time>{date ? formatAgendaDate(date) : "A definir"}</time>
              <div className="calendar-item-copy">
                <div className="agenda-meta">
                  <span className={`funnel-chip ${stage}`}>
                    {stageLabel(stage)}
                  </span>
                  <span>{item.canal || item.channel || "instagram"}</span>
                  <span>
                    {item.formato || item.format || item.tipo || item.type}
                  </span>
                </div>
                <b>{item.titulo || item.title}</b>
                <p>{item.objetivo || item.objective}</p>
                {(item.cta || item.kpi) && (
                  <small>
                    {item.cta ? `CTA · ${item.cta}` : ""}
                    {item.cta && item.kpi ? " · " : ""}
                    {item.kpi ? `KPI · ${item.kpi}` : ""}
                  </small>
                )}
              </div>
              <div className="agenda-actions">
                {item.status === "proposta" && (
                  <>
                    <button
                      className="ghost small"
                      onClick={() => void onDecision(item.id, false)}
                    >
                      Recusar
                    </button>
                    <button
                      className="primary small"
                      onClick={() => void onDecision(item.id, true)}
                    >
                      <Check /> Aprovar
                    </button>
                  </>
                )}
                {item.status === "aprovado" && (
                  <span className="agenda-badge ok">Aprovado</span>
                )}
                {item.status === "gerado" && (
                  <span className="agenda-badge ok">Em produção</span>
                )}
                {item.status === "recusado" && (
                  <span className="agenda-badge">Recusado</span>
                )}
              </div>
            </article>
          );
        })}
        {!agenda.length && <Empty text="Sua agenda ainda está vazia." />}
      </div>
    </section>
  );
}

function AcquisitionInsights({ data }: { data?: any }) {
  const instagram = data?.instagram;
  const youtube = data?.youtube;
  return (
    <Panel title="Insights de aquisição">
      <p className="muted">
        Sinais derivados das últimas coletas reais. Sem conexão ou amostra, o
        sistema não estima.
      </p>
      <div className="insight-grid">
        <div>
          <b>Instagram</b>
          <span>
            {instagram?.records || 0} conteúdos coletados · confiança{" "}
            {instagram?.confidence || "none"}
          </span>
          {instagram?.top_content ? (
            <a
              className="text-button"
              href={instagram.top_content.permalink || "#"}
              target="_blank"
              rel="noreferrer"
            >
              Ver melhor conteúdo <ExternalLink />
            </a>
          ) : (
            <small>Aguardando coleta.</small>
          )}
        </div>
        <div>
          <b>YouTube</b>
          <span>
            {youtube?.records || 0} vídeos coletados · confiança{" "}
            {youtube?.confidence || "none"}
          </span>
          {youtube?.top_video ? (
            <span>
              Mais visto:{" "}
              {youtube.top_video.title || youtube.top_video.entity_id}
            </span>
          ) : (
            <small>Conecte Google/YouTube para coletar.</small>
          )}
        </div>
      </div>
    </Panel>
  );
}

function HermesChat({
  mode,
  clientId,
}: {
  mode: "operator" | "client";
  clientId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([
    {
      from: "hermes",
      text:
        mode === "operator"
          ? "Olá. Sou o Hermes da operação. Posso consultar a fila, clientes, entregas, erros e conexões."
          : "Olá. Sou o Hermes do seu espaço. Posso ajudar com pedidos, entregas e próximos passos.",
    },
  ]);
  async function send(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text || busy) return;
    setMessages((current) => [...current, { from: "you", text }]);
    setMessage("");
    setBusy(true);
    try {
      const result = await hermesChat({ message: text, clientId });
      setMessages((current) => [
        ...current,
        { from: "hermes", text: result.reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { from: "hermes", text: (error as Error).message },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={"hermes-wrap " + mode}>
      <button
        className="hermes-launch"
        onClick={() => setOpen((value) => !value)}
      >
        <MessageCircle /> Hermes <span>{open ? "×" : "Abrir"}</span>
      </button>
      {open && (
        <section className="hermes-chat">
          <header>
            <div>
              <b>Hermes</b>
              <small>
                {mode === "operator"
                  ? "Assistente da operação"
                  : "Assistente do seu espaço"}
              </small>
            </div>
            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </header>
          <div className="hermes-messages">
            {messages.map((item, index) => (
              <div className={"hermes-message " + item.from} key={index}>
                {item.text}
              </div>
            ))}
            {busy && <div className="hermes-message hermes">Consultando…</div>}
          </div>
          <form onSubmit={send}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Pergunte ao Hermes…"
            />
            <button disabled={busy || !message.trim()}>
              <Send />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
function ConnectionSummary({
  clientId,
  connections,
  onSynced,
}: {
  clientId: string;
  connections: any[];
  onSynced: () => Promise<void>;
}) {
  const [busy, setBusy] = useState("");
  async function connect(source: "meta" | "google") {
    setBusy(source);
    try {
      const result = await beginConnection(clientId, source);
      window.location.href = result.url;
    } catch {
      setBusy("");
    }
  }
  async function sync(source: "meta" | "google") {
    setBusy(`sync-${source}`);
    try {
      await syncClientData(clientId, source);
      await onSynced();
    } finally {
      setBusy("");
    }
  }
  return (
    <Panel title="Conecte seus dados">
      <div className="portal-connections">
        <ConnectionLine
          label="Instagram e Meta"
          connected={connections.some((item) => item.source === "meta")}
          busy={busy === "meta"}
          onClick={() => void connect("meta")}
          syncing={busy === "sync-meta"}
          onSync={() => void sync("meta")}
        />
        <ConnectionLine
          label="Google e YouTube"
          connected={connections.some((item) => item.source === "google")}
          busy={busy === "google"}
          onClick={() => void connect("google")}
          syncing={busy === "sync-google"}
          onSync={() => void sync("google")}
        />
      </div>
    </Panel>
  );
}
function ClientAISetup({ clientId }: { clientId: string }) {
  const [connections, setConnections] = useState<AIConnection[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    void aiConnections(clientId)
      .then(setConnections)
      .catch((error) => setError((error as Error).message));
  }, [clientId]);
  return (
    <Panel title="Conexão de IA do cliente">
      <p className="muted">
        Envie sua chave do provedor para habilitar geração de imagens e vídeos.
        Ela fica criptografada e não será exibida novamente.
      </p>
      {error && <div className="error">{error}</div>}
      <AIConnections
        clientId={clientId}
        connections={connections}
        onSaved={setConnections}
        onError={setError}
      />
    </Panel>
  );
}
function ConnectionLine({
  label,
  connected,
  busy,
  onClick,
  syncing,
  onSync,
}: {
  label: string;
  connected: boolean;
  busy: boolean;
  onClick: () => void;
  syncing: boolean;
  onSync: () => void;
}) {
  return (
    <div className="connection-line">
      <b>{label}</b>
      <span
        className={
          connected ? "connection-status connected" : "connection-status"
        }
      >
        <i /> {connected ? "Conectado" : "Não conectado"}
      </span>
      {!connected && (
        <button className="text-button" disabled={busy} onClick={onClick}>
          {busy ? "Abrindo…" : "Conectar"} <Link2 />
        </button>
      )}
      {connected && (
        <button className="text-button" disabled={syncing} onClick={onSync}>
          {syncing ? "Extraindo…" : "Atualizar dados"} <BarChart3 />
        </button>
      )}
    </div>
  );
}
function ClientRequestForm({ slug }: { slug: string }) {
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await createClientRequest(slug, {
        title,
        requestType: "strategy",
        objective: title,
        prompt: brief,
        brief,
        requiresApproval: true,
      });
      setDone(true);
      setTitle("");
      setBrief("");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel title="Começar um pedido">
      <form onSubmit={submit}>
        {done ? (
          <SuccessState
            title="Pedido enviado"
            text="O time recebeu seu contexto e vai retornar com o próximo passo."
          />
        ) : (
          <>
            <Field
              label="O que você quer realizar?"
              value={title}
              onChange={setTitle}
              placeholder="Ex.: campanha para o lançamento de junho"
              required
            />
            <Field
              label="Conte o que já sabe"
              value={brief}
              onChange={setBrief}
              placeholder="Objetivo, prazo, público ou materiais disponíveis."
              multiline
              required
            />
            <button className="primary" disabled={busy}>
              {busy ? "Enviando…" : "Enviar pedido"} <SendIcon />
            </button>
          </>
        )}
      </form>
    </Panel>
  );
}

function Login({
  onDone,
  clientMode = false,
}: {
  onDone: () => void;
  clientMode?: boolean;
}) {
  const slug = clientMode ? new URLSearchParams(window.location.search).get("slug") || "" : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      if (clientMode) {
        const list = await clients().catch(() => []);
        const mine = (list || [])
          .map((item) => item.client_id)
          .find((id) => id);
        if (mine) {
          window.location.href = "/dados/" + encodeURIComponent(mine);
          return;
        }
        setError(
          "Seu e-mail ainda não está associado a nenhum espaço. Fale com a equipe que te convidou.",
        );
        return;
      }
      onDone();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-screen">
      <div className="login-visual">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            <b>MarketingOS</b>
            <small>OPERAÇÃO DE MARKETING</small>
          </div>
        </div>
        <div>
          <div className="eyebrow">
            {clientMode ? "PORTAL DO CLIENTE" : "WORKSPACE DO OPERADOR"}
          </div>
          <h1>
            {clientMode
              ? "Veja o que está em movimento."
              : "Clareza para produzir melhor."}
          </h1>
          <p>
            Contexto certo, decisões melhores e uma fila de trabalho que mostra
            o próximo passo.
          </p>
        </div>
        <div className="login-orbit">
          <span>CONTEXTO</span>
          <span>PRODUÇÃO</span>
          <span>ENTREGA</span>
        </div>
      </div>
      <div className="login-panel">
        <div className="mobile-brand brand">
          <span className="brand-mark">M</span>
          <b>MarketingOS</b>
        </div>
        <div className="eyebrow">
          {clientMode ? "ENTRAR NO SEU ESPAÇO" : "ENTRAR NA OPERAÇÃO"}
        </div>
        <h2>{clientMode ? "Bem-vindo de volta." : "Vamos começar."}</h2>
        <p className="muted">
          {clientMode
            ? "Use o e-mail do convite para acompanhar seu marketing."
            : "Acesse seu workspace para cuidar dos clientes."}
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Field
            label="E-mail"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
          <Field
            label="Senha"
            value={password}
            onChange={setPassword}
            type="password"
            required
          />
          {error && <div className="error">{error}</div>}
          <button className="primary wide" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"} <ArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
function Page({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">MARKETINGOS</div>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="metric-card">
      <span>{icon}</span>
      <div>
        <b>{value}</b>
        <small>{label}</small>
      </div>
    </div>
  );
}
function PathStep({
  done,
  number,
  label,
}: {
  done?: boolean;
  number: string;
  label: string;
}) {
  return (
    <div className={"path-step " + (done ? "done" : "")}>
      <span>{done ? <Check /> : number}</span>
      <b>{label}</b>
    </div>
  );
}
function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="stepper">
      {labels.map((label, index) => (
        <div
          className={
            (step > index ? "done " : "") +
            (step === index + 1 ? "current" : "")
          }
          key={label}
        >
          <span>{step > index + 1 ? <Check /> : index + 1}</span>
          {label}
        </div>
      ))}
    </div>
  );
}
function Action({
  done,
  title,
  description,
}: {
  done: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className={"action-item " + (done ? "done" : "")}>
      <span>{done ? <Check /> : <ArrowRight />}</span>
      <div>
        <b>{title}</b>
        <small>{description}</small>
      </div>
    </div>
  );
}
function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  required,
  multiline = false,
  type = "text",
  select = false,
  options = [],
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  select?: boolean;
  options?: { value: string; label: string }[];
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <em> *</em>}
      </span>
      {hint && <small>{hint}</small>}
      {select ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        >
          <option value="">Escolha um cliente</option>
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      )}
    </label>
  );
}
function SetupBadge({ client }: { client: Client }) {
  return (
    <span
      className={"setup-badge " + (client.setup?.referenceReady ? "ready" : "")}
    >
      {client.setup?.referenceReady ? "Pronto" : "Preparar"}
    </span>
  );
}
function setupPercent(client: Client) {
  return (
    [
      client.setup?.referenceReady,
      Boolean(client.sources?.length),
      Boolean(client.members),
    ].filter(Boolean).length * 33
  );
}
function setupText(client: Client) {
  const percent = setupPercent(client);
  return percent === 99
    ? "Tudo pronto para operar."
    : percent === 0
      ? "Falta completar o contexto e conectar o cliente."
      : "Mais um passo para deixar o cliente pronto.";
}
function SuccessState({ title, text }: { title: string; text: string }) {
  return (
    <div className="success-state">
      <CheckCircle2 />
      <b>{title}</b>
      <span>{text}</span>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Sparkles />
      <span>{text}</span>
    </div>
  );
}
function StatusDot({ status }: { status: string }) {
  return <span className="status-dot" data-status={status} />;
}
function Status({ value }: { value: string }) {
  return (
    <span className="status-pill" data-status={value}>
      {statusLabel(value)}
    </span>
  );
}
function statusLabel(value: string) {
  return (
    (
      {
        routed: "Na fila",
        queued: "Na fila",
        running: "Produzindo",
        review: "Revisar",
        approved: "Aprovado",
        published: "Publicado",
        done: "Concluído",
        blocked: "Bloqueado",
        error: "Erro",
      } as Record<string, string>
    )[value] || value
  );
}
function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}
function initials(value: string) {
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}
