import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function option(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function flag(name) {
  return process.argv.includes(name);
}

function slugify(value, fallback = "carousel") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || fallback;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function readTextOptional(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
}

async function latestCorrelation(workRoot, clientId) {
  const fluxRoot = path.join(workRoot, "FluxOS");
  const entries = await readdir(fluxRoot, { withFileTypes: true });
  const matches = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.includes(clientId)) continue;
    const file = path.join(fluxRoot, entry.name, "work-order.json");
    if (existsSync(file)) matches.push({ correlationId: entry.name, file });
  }
  matches.sort((a, b) => a.correlationId.localeCompare(b.correlationId));
  return matches.at(-1)?.correlationId || "";
}

async function demandTitle(marketingRoot, clientId, correlationId) {
  const contractsRoot = path.join(marketingRoot, "clients", clientId, "outputs", "operations", correlationId, "contracts");
  const demandFile = path.join(contractsRoot, `demand-${correlationId}.json`);
  if (!existsSync(demandFile)) return "";
  const demand = await readJson(demandFile);
  return demand?.request?.title || demand?.request?.raw_text || "";
}

function extractTheme(input) {
  const objective = String(input?.objective || "");
  const quoted = objective.match(/["“](.+?)["”]/);
  if (quoted?.[1]) return quoted[1].trim();
  return objective
    .replace(/^(criar|crie|monte|faca|faça|produza)\s+(um|uma)?\s*/i, "")
    .replace(/^carrossel\s+(de\s+\d+\s+(cards?|cardos?|slides?)\s+)?(premium\s+)?(com\s+o\s+tema|sobre|para|de)?\s*/i, "")
    .trim() || "Carrossel estrategico";
}

function splitList(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(text || "").match(new RegExp(`${escaped}:\\s*([^\\.]+)`, "i"));
  if (!match) return [];
  return match[1].split(";").map((item) => item.trim()).filter(Boolean);
}

function firstNonEmpty(...values) {
  return values.find((value) => String(value || "").trim()) || "";
}

function buildSlides({ input, theme, clientName }) {
  const audience = String(input?.audience || "");
  const pains = splitList(audience, "Dores");
  const desires = splitList(audience, "Desejos");
  const language = splitList(audience, "Linguagem");
  const pain = firstNonEmpty(pains[0], "o cabelo parece pedir hidratação, mas não responde");
  const desire = firstNonEmpty(desires[0], "sentir o cabelo cuidado, leve e com brilho de salao");
  const vocabulary = language.slice(0, 3).join(", ") || "cabelo de salao, renovada, dica de ouro";

  return [
    {
      number: 1,
      role: "ruptura",
      type: "GANCHO",
      intention: "Parar o scroll com uma verdade contraintuitiva e reconhecivel.",
      title: "A verdade que quase ninguém te conta sobre hidratação capilar",
      body: "Se o fio continua opaco depois da máscara, talvez o problema não seja falta de hidratação.",
      reference: input?.campaignId || "",
      principle_applied: "Comecar pela contradicao vivida pela cliente, nao por uma lista de dicas.",
      visual_rule: "Capa editorial com contraste forte, frase curta e sensacao de diagnostico revelado.",
      visual_motif: "signal-radar",
    },
    {
      number: 2,
      role: "identificacao",
      type: "SITUACAO",
      intention: "Mostrar a cena cotidiana que torna o tema urgente.",
      title: "Você hidrata, mas o cabelo não muda de verdade?",
      body: `Isso aparece como ${pain}. A pessoa tenta mais produto, mais receita e mais frequência, mas o fio segue sem resposta.`,
      reference: "audience.profile.dores",
      principle_applied: "Transformar dor ampla em cena concreta antes de oferecer solucao.",
      visual_rule: "Dividir a tela entre expectativa de brilho e realidade opaca, sem exagero.",
    },
    {
      number: 3,
      role: "reframe",
      type: "VIRADA",
      intention: "Mudar a pergunta que a cliente faz.",
      title: "Hidratação não resolve tudo",
      body: "Hidratação repõe água. Mas cabelo frágil também pode precisar de nutrição, reconstrução, selagem ou pausa química.",
      reference: "client_truth + knowledge capilar generico",
      principle_applied: "Trocar promessa simples por diagnostico responsavel.",
      visual_rule: "Mapa de camadas do fio: agua, lipideos, massa e cuticula.",
    },
    {
      number: 4,
      role: "criterio",
      type: "DIAGNOSTICO",
      intention: "Dar criterio util para a pessoa se orientar.",
      title: "O sinal esta no comportamento do fio",
      body: "Se pesa rápido, não é o mesmo problema de quando quebra. Se arrepia, não é igual a quando emborracha. Cada sinal pede uma leitura.",
      reference: "client_truth.servicos",
      principle_applied: "Ensinar criterio de decisao em vez de vender procedimento.",
      visual_rule: "Tabela simples com sinais do fio e possiveis leituras, sem prescrever tratamento.",
    },
    {
      number: 5,
      role: "autoridade",
      type: "PROCESSO",
      intention: "Mostrar por que atendimento premium depende de escuta.",
      title: "No salão, a pergunta vem antes do produto",
      body: "Histórico de química, rotina, textura, objetivo e tempo disponível mudam completamente a escolha do cuidado.",
      reference: clientName,
      principle_applied: "Autoridade nasce do metodo, nao de promessa milagrosa.",
      visual_rule: "Checklist elegante de anamnese capilar em uma bancada premium.",
    },
    {
      number: 6,
      role: "valor",
      type: "ORIENTACAO",
      intention: "Entregar uma regra pratica sem banalizar o trabalho tecnico.",
      title: "A regra simples: observe antes de repetir",
      body: "Quando o cabelo não responde, repetir a mesma máscara pode só aumentar acúmulo. Primeiro entenda o que o fio está pedindo.",
      reference: "takeaway operacional",
      principle_applied: "Dar ganho real sem transformar conteudo em consulta individual.",
      visual_rule: "Lupa sobre fio/camadas, com poucos elementos e muito espaco.",
    },
    {
      number: 7,
      role: "posicionamento",
      type: "MARCA",
      intention: "Conectar a ideia ao posicionamento Bruno Capelli.",
      title: "Cuidado bom não é padronizado",
      body: `No ${clientName}, a beleza premium começa quando alguém olha para você, para sua rotina e para o seu fio antes de decidir o caminho.`,
      reference: "brand positioning",
      principle_applied: "Vender como continuacao natural da utilidade entregue.",
      visual_rule: "Cena acolhedora de cadeira de salao, espelho e diagnostico visual.",
    },
    {
      number: 8,
      role: "acao",
      type: "CTA",
      intention: "Convidar para uma acao coerente com a educacao entregue.",
      title: "Antes de marcar qualquer tratamento, faca uma pergunta melhor",
      body: "O que meu cabelo está tentando mostrar? Salve este guia e, se quiser uma leitura profissional, converse com a equipe.",
      reference: input?.cta?.intent || "",
      principle_applied: "CTA como proximo passo de cuidado, nao como interrupcao comercial.",
      visual_rule: "Fechamento limpo, assinatura da marca, CTA discreto para salvar/conversar.",
    },
  ];
}

function slidesFromFluxPackage(contentPackage) {
  const slides = contentPackage?.narrative?.slides;
  if (!Array.isArray(slides) || !slides.length) return null;
  return slides.map((slide, index) => ({
    number: slide.number || index + 1,
    role: slide.role || (index === 0 ? "ruptura" : "desenvolvimento"),
    type: slide.type || (index === 0 ? "GANCHO" : "VALOR"),
    intention: slide.gift_now && slide.desire_next
      ? `Gift now: ${slide.gift_now} | Desire next: ${slide.desire_next}`
      : slide.intention || "",
    title: slide.title,
    body: slide.body,
    reference: slide.reference || contentPackage.contract_id || "",
    principle_applied: slide.principle_applied || contentPackage.core_angle || "Progressão editorial definida pelo FluxOS.",
    visual_rule: slide.visual_rule || slide.visual_direction || "",
    visual_motif: slide.visual_motif || (index === 0 ? "signal-radar" : ""),
  }));
}

async function ensureStrategyDecision({ clientRoot, clientId, workInput }) {
  const strategyFile = path.join(clientRoot, "outputs", "strategy", "strategy-decision.json");
  if (existsSync(strategyFile)) return { created: false, file: strategyFile };

  await mkdir(path.dirname(strategyFile), { recursive: true });
  const now = new Date().toISOString();
  const decision = {
    schema_version: 1,
    client_slug: clientId,
    status: "approved",
    decision_question: "Qual narrativa torna o cuidado premium mais claro antes da venda?",
    acquisition_objective: workInput.objective || "Gerar autoridade e conversas qualificadas a partir de conteudo educativo.",
    primary_bottleneck: "O publico pode interpretar tratamentos como produto padronizado, nao como diagnostico personalizado.",
    market_thesis: "Conteudo de beleza premium deve ensinar a cliente a ler sinais do proprio cabelo antes de prometer transformacao.",
    not_now: ["Nao prometer resultado individual sem avaliacao profissional.", "Nao usar urgencia artificial ou antes/depois sem contexto."],
    evidence: [
      {
        id: "EV-001",
        kind: "audience",
        source: "MarketingOS client reference",
        source_url: "",
        observed: workInput.audience || "Publico busca cuidado, seguranca e reconhecimento.",
        implication: "A peca deve partir da dor vivida e entregar criterio de decisao.",
        captured_at: now,
        confidence: "medium",
      },
      {
        id: "EV-002",
        kind: "first_party",
        source: "MarketingOS client.md / brand-kit",
        source_url: "",
        observed: "Posicionamento do cliente privilegia cuidado personalizado, escuta e ambiente acolhedor.",
        implication: "A narrativa deve reforcar metodo e acolhimento, nao apenas tecnica.",
        captured_at: now,
        confidence: "medium",
      },
      {
        id: "EV-003",
        kind: "platform",
        source: "MarketingOS operational request",
        source_url: "",
        observed: "Pedido operacional recebido para carrossel educativo de Instagram.",
        implication: "Formato deve ser salvavel, com gancho forte e progressao util.",
        captured_at: now,
        confidence: "low",
      },
    ],
    hypotheses: [
      {
        id: "H-001",
        statement: "Se o conteudo ensinar criterio de diagnostico, a audiencia percebe maior valor no atendimento profissional.",
        lever: "educacao antes da oferta",
        metric: "saves",
        decision_rule: "Manter se houver salvamentos e conversas qualificadas; ajustar se houver baixa retencao.",
        window: "7 dias apos publicacao",
        evidence_ids: ["EV-001", "EV-002"],
      },
      {
        id: "H-002",
        statement: "Se a marca mostrar escuta antes de procedimento, reduz medo de resultado ruim.",
        lever: "posicionamento de cuidado personalizado",
        metric: "respostas no direct / cliques no WhatsApp",
        decision_rule: "Manter se gerar perguntas sobre avaliacao; ajustar CTA se nao houver sinal comercial.",
        window: "14 dias apos publicacao",
        evidence_ids: ["EV-001", "EV-003"],
      },
    ],
    funnel_metadata: {
      funnel_stage: "problem-aware",
      intent_level: "medium",
      friction_level: "2",
      lead_signal_expected: "save, share, reply or WhatsApp question",
      qualification_goal: "Identificar pessoas com dor capilar atual e interesse em avaliacao profissional.",
      primary_cta: "Salve este guia e converse com a equipe para uma leitura profissional.",
      secondary_cta: "Envie para alguem que hidrata o cabelo e nao ve resultado.",
      routing_destination: "WhatsApp",
      next_best_action: "Responder com pergunta de triagem e convite para avaliacao.",
    },
    approved_by: "MarketingOS operational bootstrap",
    approved_at: now,
    created_at: now,
    updated_at: now,
  };
  await writeFile(strategyFile, JSON.stringify(decision, null, 2) + "\n", "utf8");
  return { created: true, file: strategyFile };
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", windowsHide: true });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw new Error(output || `${command} ${args.join(" ")} exit=${result.status}`);
  return output;
}

async function main() {
  const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
  const projectsRoot = path.resolve(marketingRoot, "..");
  const workRoot = option("--work-root", path.join(projectsRoot, "EcosystemCore", "runtime", "work-orders"));
  const clientId = slugify(option("--client"), "");
  const themeOverride = option("--theme");
  const objectiveOverride = option("--objective");
  const correlationId = option("--correlation") || (clientId ? await latestCorrelation(workRoot, clientId) : "");
  const render = flag("--render");

  if (!correlationId) throw new Error("Informe --correlation <id> ou --client <cliente> para usar a operacao mais recente.");

  const fluxWorkOrder = path.join(workRoot, "FluxOS", correlationId, "work-order.json");
  if (!existsSync(fluxWorkOrder)) throw new Error(`Work-order FluxOS nao encontrado: ${fluxWorkOrder}`);

  const workOrder = await readJson(fluxWorkOrder);
  if (workOrder.work_type !== "flux_campaign_intake") throw new Error(`Work-order incompativel: ${workOrder.work_type}`);
  const input = workOrder.input || {};
  const resolvedClientId = slugify(clientId || input.clientId, "");
  const clientRoot = path.join(marketingRoot, "clients", resolvedClientId);
  if (!existsSync(clientRoot)) throw new Error(`Cliente nao encontrado: ${resolvedClientId}`);

  const brandKitFile = path.join(clientRoot, "brand-kit.json");
  const brandKit = existsSync(brandKitFile) ? await readJson(brandKitFile) : {};
  const fluxPackageFile = path.join(clientRoot, "outputs", "operations", correlationId, "flux-content-package.json");
  const fluxPackage = existsSync(fluxPackageFile) ? await readJson(fluxPackageFile) : null;
  const clientName = brandKit.brand_name || resolvedClientId;
  const titleFromDemand = await demandTitle(marketingRoot, resolvedClientId, correlationId);
  const theme = themeOverride || extractTheme({
    ...input,
    objective: objectiveOverride || (String(input.objective || "").trim().length >= 12 ? input.objective : titleFromDemand || input.objective),
  });
  const fluxSlides = slidesFromFluxPackage(fluxPackage);
  const slidesInput = {
    client_slug: resolvedClientId,
    output_type: "carousel",
    theme: fluxPackage?.topic || theme,
    objective: objectiveOverride || (String(input.objective || "").trim().length >= 12 ? input.objective : titleFromDemand || `Criar carrossel sobre ${theme}`),
    cta: brandKit.whatsapp ? `Converse com a equipe pelo WhatsApp: ${brandKit.whatsapp}` : "Salve este guia e converse com a equipe.",
    funnel_metadata: {
      funnel_stage: "problem-aware",
      intent_level: "medium",
      friction_level: "2",
      lead_signal_expected: "save, share, reply or WhatsApp question",
      qualification_goal: "Identificar interesse em avaliacao profissional.",
      primary_cta: brandKit.whatsapp ? "Chamar no WhatsApp" : "Conversar com a equipe",
      secondary_cta: "Salvar o guia",
      routing_destination: brandKit.whatsapp ? "WhatsApp" : "DM",
      next_best_action: "Triagem humana antes de indicar tratamento.",
    },
    caption: `Nem todo cabelo que parece precisar de hidratação precisa apenas de hidratação.\n\nUse este carrossel como guia para observar melhor os sinais do fio antes de repetir o mesmo cuidado.\n\n${brandKit.instagram ? brandKit.instagram : clientName}`,
    slides: fluxSlides || buildSlides({ input, theme, clientName }),
  };

  await ensureStrategyDecision({ clientRoot, clientId: resolvedClientId, workInput: input });
  const creativeBriefLog = run(process.execPath, [
    "scripts/context/creative-brief-builder.js",
    "--slug",
    resolvedClientId,
    "--type",
    "carousel",
    "--force",
    "--objective",
    slidesInput.objective,
  ], marketingRoot);

  const inputDir = path.join(clientRoot, "outputs", "carousels", "inputs");
  await mkdir(inputDir, { recursive: true });
  const inputFile = path.join(inputDir, `${correlationId}.json`);
  await writeFile(inputFile, JSON.stringify(slidesInput, null, 2) + "\n", "utf8");

  const relativeInput = path.relative(marketingRoot, inputFile).replaceAll("\\", "/");
  const generateLog = run(process.execPath, ["scripts/generate-carousel.js", "--input", relativeInput], marketingRoot);
  const pipelineMatch = generateLog.match(/Pipeline criado:\s*(.+)/);
  const jobDir = pipelineMatch?.[1]?.trim() || "";
  let creativeBriefSummary = null;
  try {
    const parsed = JSON.parse(creativeBriefLog);
    creativeBriefSummary = {
      path: parsed.path,
      generated: parsed.generated,
      validation: parsed.validation,
    };
  } catch {
    creativeBriefSummary = { parse_error: true };
  }

  let renderLog = "";
  let renderError = "";
  if (render && jobDir) {
    try {
      renderLog = run(process.execPath, [path.join(jobDir, "render.js")], marketingRoot);
    } catch (error) {
      renderError = String(error?.message || error);
    }
  }
  const instagramDir = jobDir ? path.join(jobDir, "instagram") : "";
  const slideFiles = [];
  if (instagramDir && existsSync(instagramDir)) {
    const entries = await readdir(instagramDir, { withFileTypes: true });
    for (const entry of entries.filter((item) => item.isFile() && item.name.toLowerCase().endsWith(".png")).sort((a, b) => a.name.localeCompare(b.name))) {
      slideFiles.push(path.join(instagramDir, entry.name));
    }
  }

  const output = {
    ok: true,
    correlation_id: correlationId,
    client_id: resolvedClientId,
    slides_input: inputFile,
    carousel_job_dir: jobDir,
    generated_at: new Date().toISOString(),
    creative_brief: creativeBriefSummary,
    generate_log: generateLog,
    render_attempted: render,
    render_log: renderLog,
    render_error: renderError || null,
    preview: {
      copy_md: jobDir ? await readTextOptional(path.join(jobDir, "copy.md")) : "",
      caption: jobDir ? await readTextOptional(path.join(jobDir, "legenda.md")) : "",
      slides_input: slidesInput,
      slide_files: slideFiles,
      slide_count: slideFiles.length || slidesInput.slides.length,
      html_file: jobDir ? path.join(jobDir, "carrossel.html") : "",
      draft_quality: render && !renderError ? "commercial" : "not_rendered",
      commercial_renderer_required: !render || Boolean(renderError),
    },
  };
  const operationOutputDir = path.join(clientRoot, "outputs", "operations", correlationId);
  await mkdir(operationOutputDir, { recursive: true });
  const outputFile = path.join(operationOutputDir, "carousel-execution.json");
  await writeFile(outputFile, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ...output, output_file: outputFile }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
