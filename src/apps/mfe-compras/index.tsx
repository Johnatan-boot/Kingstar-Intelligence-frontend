import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { purchasesApi } from "../../services/api";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "#facc15" }, // text-yellow-400
  RECEIVING: { label: "Recebendo", color: "#38bdf8" }, // text-sky-400
  CONFERENCE: { label: "Conferência", color: "#a855f7" }, // text-purple-500
  COMPLETED: { label: "Concluído", color: "#22c55e" }, // text-green-500
  CANCELLED: { label: "Cancelado", color: "#ef4444" }, // text-red-500
};

function Badge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, color: "#9ca3af" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{
        color: s.color,
        backgroundColor: `${s.color}15`,
        border: `1px solid ${s.color}30`,
      }}
    >
      {s.label}
    </span>
  );
}

// ──────────────────────────────────────────────
// Modal de Preview do Excel
// ──────────────────────────────────────────────
function ExcelPreviewModal({
  rows,
  onConfirm,
  onClose,
  importing,
}: {
  rows: any[];
  onConfirm: () => void;
  onClose: () => void;
  importing: boolean;
}) {
  const validos = rows.filter((r) => r._valido);
  const invalidos = rows.filter((r) => !r._valido);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#161616] border border-[#242424] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-5 border-b border-[#242424]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <FileSpreadsheet size={20} className="text-emerald-500" />
            </div>
            <h2 className="font-bold text-lg text-white">Preview da Planilha</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#121212]">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-3xl font-black text-emerald-500 font-mono leading-none">{validos.length}</p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Linhas válidas prontas para importar</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-3xl font-black text-red-500 font-mono leading-none">{invalidos.length}</p>
            <p className="text-xs text-red-400 mt-2 font-medium">Linhas com erro (serão ignoradas)</p>
          </div>
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <p className="text-3xl font-black text-sky-500 font-mono leading-none">{rows.length}</p>
            <p className="text-xs text-sky-400 mt-2 font-medium">Total de linhas lidas no arquivo</p>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto bg-[#1a1a1a]">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-[#161616] text-[#8b9dc3] border-y border-[#242424]">
              <tr>
                {["#", "Nº Pedido", "NF", "Fornecedor", "Data", "Itens", "Qtd", "Validação"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {rows.map((row, i) => (
                <tr key={i} className={`hover:bg-[#ffffff05] transition-colors ${!row._valido ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3 font-mono text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-gray-400">{row.numero_pedido ?? row.pedido ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-sky-400">{row.numero_nf ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-300">{row.fornecedor ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{formatarValorTabela(row.previsao_entrega)}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate" title={row.descricao}>
                    {row.sku ? `[${row.sku}] ` : ""}{row.descricao ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-100">{row.quantidade ?? "—"}</td>
                  <td className="px-4 py-3">
                    {row._valido ? (
                      <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                        <CheckCircle size={14} className="shrink-0"/> OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 font-bold" title={row._erro}>
                        <XCircle size={14} className="shrink-0"/> Erro
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invalidos.length > 0 && (
          <div className="px-5 py-3 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            As linhas inválidas não serão criadas. Corrija na planilha e importe novamente, se necessário.
          </div>
        )}

        <div className="p-5 border-t border-[#242424] flex justify-end gap-3 bg-[#121212]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={validos.length === 0 || importing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              validos.length === 0 
                ? "bg-[#333] text-gray-500 cursor-not-allowed" 
                : "bg-emerald-500 hover:bg-emerald-400 text-black"
            }`}
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {importing ? "Importando..." : `Importar ${validos.length} pedido(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helpers Excel
// ──────────────────────────────────────────────
function normalizarChave(k: string): string {
  return k
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-\.]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function lerExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const rows = json.map((row: any, idx: number) => {
          const normalized: any = {};
          Object.entries(row).forEach(([k, v]) => {
            normalized[normalizarChave(k)] = v;
          });

          const r: any = {
            numero_pedido: normalized.pedido ?? normalized.numero_pedido ?? "",
            fornecedor: normalized.fornecedor ?? normalized.supplier ?? normalized.fornecedora ?? "",
            numero_nf: normalized.numero_nf ?? normalized.nf ?? normalized.nota_fiscal ?? normalized.nf_number ?? "",
            valor_nf: normalized.valor_nf ?? normalized.valor ?? normalized.nf_value ?? "",
            sku: normalized.sku ?? normalized.codigo ?? normalized.code ?? normalized.produto ?? "",
            descricao: normalized.descricao ?? normalized.description ?? normalized.produto ?? normalized.item ?? "",
            quantidade: normalized.quantidade ?? normalized.qtd ?? normalized.qty ?? normalized.quantity ?? "",
            custo_unitario: normalized.custo_unitario ?? normalized.custo ?? normalized.preco ?? normalized.unit_cost ?? normalized.preco_unitario ?? "",
            previsao_entrega: normalized.previsao_entrega ?? normalized.previsao ?? normalized.data ?? normalized.expected_at ?? "",
            status_planilha: normalized.status ?? "",
          };

          if (r.previsao_entrega instanceof Date) {
            r.previsao_entrega = r.previsao_entrega.toISOString().split("T")[0];
          } else if (typeof r.previsao_entrega === "number") {
             const date = XLSX.SSF.parse_date_code(r.previsao_entrega);
             if (date) {
                r.previsao_entrega = new Date(date.y, date.m - 1, date.d).toISOString().split("T")[0];
             }
          } else if (typeof r.previsao_entrega === "string" && r.previsao_entrega.includes('/')) {
             const parts = r.previsao_entrega.split('/');
             if (parts.length === 3) r.previsao_entrega = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }

          if (!r.descricao && !r.sku && r.numero_nf) {
             r.descricao = `Mercadorias NF ${r.numero_nf}`;
          }

          const erros: string[] = [];
          if (!r.fornecedor) erros.push("Fornecedor obrigatório");
          if (!r.descricao && !r.sku) erros.push("NF ou Descrição obrigatório");
          if (!r.quantidade || isNaN(Number(r.quantidade))) erros.push("Quantidade inválida");

          r._valido = erros.length === 0;
          r._erro = erros.join(", ");
          r._linha = idx + 2;
          return r;
        });

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function gerarModeloExcel() {
  const modelo = [
    {
      fornecedor: "Fornecedor Exemplo Ltda",
      numero_nf: "NF-12345",
      valor_nf: 5000.0,
      sku: "COL-ORTO-001",
      descricao: "Colchão Ortopédico Casal",
      quantidade: 10,
      custo_unitario: 450.0,
      previsao_entrega: "2025-06-15",
    },
    {
      fornecedor: "Distribuidora Premium SA",
      numero_nf: "NF-12346",
      valor_nf: 2500.0,
      sku: "TRV-MEM-002",
      descricao: "Travesseiro Memory Foam",
      quantidade: 50,
      custo_unitario: 50.0,
      previsao_entrega: "2025-06-20",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(modelo);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Compras");
  XLSX.writeFile(wb, "modelo_importacao_compras.xlsx");
}

function formatarValorTabela(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) {
    return value.toLocaleDateString("pt-BR");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
}

// ──────────────────────────────────────────────
// Página Principal
// ──────────────────────────────────────────────
export function PurchasingMfe() {
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [skus, setSkus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelRows, setExcelRows] = useState<any[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    nfNumber: "",
    nfValue: "",
    expectedAt: "",
    items: [
      { skuId: "", description: "", unit: "UN", expectedQuantity: 1, unitCost: 0 },
    ],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [posRes, supRes, skuRes] = await Promise.all([
        purchasesApi.list({}),
        purchasesApi.suppliers(),
        purchasesApi.skus(),
      ]);
      setPos((posRes as any).data?.dados || (posRes as any).data?.data || []);
      setSuppliers((supRes as any).data?.dados || (supRes as any).data?.data || []);
      setSkus((skuRes as any).data?.dados || (skuRes as any).data?.data || []);
    } catch {
      toast.error("Menu de mocks ativo — Usando dados de demonstração");
      setPos([
        { id: '1', nf_number: '12345', supplier_name: 'Fornecedor A', status: 'PENDING', created_at: new Date().toISOString(), items: [
          { sku_id: 'SKU-777', description: 'Item Mock Teste', expected_quantity: 10, unit_cost: 13.5 }
        ] }
      ]);
      setSuppliers([{id: '1', nome_fantasia: 'Fornecedor A'}]);
      setSkus([{id: '1', descricao: 'SKU Teste'}]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus, page]);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  
  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { skuId: "", description: "", unit: "UN", expectedQuantity: 1, unitCost: 0 }],
    }));
  
  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  
  const setItem = (i: number, k: string, v: any) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)),
    }));

  const handleSubmit = async () => {
    if (!form.supplierId) return toast.error("Selecione o fornecedor");
    if (form.items.some((i) => !i.skuId && !i.description)) return toast.error("Preencha todos os itens");
    setSubmitting(true);
    try {
      await purchasesApi.create({
        supplierId: form.supplierId,
        nfNumber: form.nfNumber || undefined,
        nfValue: form.nfValue ? Number(form.nfValue) : undefined,
        expectedAt: form.expectedAt ? new Date(form.expectedAt).toISOString() : undefined,
        items: form.items.map((i) => ({
          skuId: i.skuId || i.description,
          unit: i.unit,
          expectedQuantity: Number(i.expectedQuantity),
          unitCost: Number(i.unitCost),
        })),
      });
      toast.success("Pedido criado com sucesso!");
      setShowForm(false);
      setForm({
        supplierId: "", nfNumber: "", nfValue: "", expectedAt: "",
        items: [{ skuId: "", description: "", unit: "UN", expectedQuantity: 1, unitCost: 0 }],
      });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.response?.data?.mensagem ?? "Erro ao criar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt("Motivo do cancelamento:");
    if (!reason) return;
    try {
      await purchasesApi.cancel(id, reason);
      toast.success("Pedido cancelado");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Erro ao cancelar");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) return toast.error("Formato inválido. Use .xlsx, .xls ou .csv");

    const tid = toast.loading("Lendo arquivo, aguarde...");
    try {
      await new Promise(resolve => setTimeout(resolve, 50)); // let UI render toast
      const rows = await lerExcel(file);
      toast.dismiss(tid);
      if (rows.length === 0) return toast.error("Planilha vazia ou sem dados reconhecidos");
      setSelectedFile(file);
      setExcelRows(rows);
    } catch {
      toast.dismiss(tid);
      toast.error("Erro ao ler o arquivo. Verifique se é um Excel válido.");
    }
  };

  // Este preview (lerExcel) roda no navegador só para o usuário conferir as
  // linhas antes de confirmar. A importação de fato é feita enviando o
  // arquivo original para o backend (POST /compras/importar), que faz o
  // parse novamente no servidor com a validação oficial (planilhaLinhaSchema)
  // e captura campos essenciais para o recebimento (placa/tipo de veículo)
  // que este preview não usa. Isso evita divergência entre o que valida no
  // preview e o que efetivamente é gravado no banco.
  const handleImportConfirm = async () => {
    if (!excelRows || !selectedFile) return;
    const validos = excelRows.filter((r) => r._valido);
    if (validos.length === 0) return toast.error("Nenhuma linha válida para importar");

    setImporting(true);
    try {
      const resultado = await purchasesApi.importar(selectedFile);
      const pedidosCriados = resultado?.data?.pedidosCriados ?? 0;
      toast.success(`${pedidosCriados} pedido(s) importado(s) com sucesso!`);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Erro ao importar planilha";
      toast.error(msg, { duration: 8000 });
    } finally {
      setImporting(false);
      setExcelRows(null);
      setSelectedFile(null);
      load();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Cabeçalho e Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <ShoppingCart size={24} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Compras e Recebimentos</h1>
            <p className="text-sm text-[#8b9dc3] mt-1 font-medium">Gestão de pedidos, NFs e importação via planilha</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#242424] rounded-lg text-sm text-gray-200 outline-none focus:border-sky-500/50 transition-colors"
          >
            <option value="">Status: Todos</option>
            {Object.entries(STATUS_LABEL).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>

          <button
            onClick={gerarModeloExcel}
            title="Download Planilha Padrão"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download size={16} /> <span className="hidden sm:inline">Modelo Padrão</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-semibold transition-colors"
          >
            <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Importar Excel</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            <Plus size={16} /> Novo Pedido
          </button>
        </div>
      </div>

      {/* Formulário Novo Pedido */}
      {showForm && (
        <div className="bg-[#1a1a1a] border border-[#242424] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-[#242424] flex justify-between items-center bg-[#161616]">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShoppingCart size={18} className="text-sky-400" />
              Cadastro Manual de Pedido
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white p-1 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-8">
            {/* Dados do Pedido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fornecedor *</label>
                <select
                  value={form.supplierId}
                  onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-sky-500/50 outline-none transition-colors"
                >
                  <option value="">Selecionar fornecedor...</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.trade_name ?? s.nome_fantasia ?? s.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Número NF</label>
                <input
                  type="text" placeholder="Ex: NF-0001"
                  value={form.nfNumber} onChange={(e) => setForm((p) => ({ ...p, nfNumber: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white font-mono placeholder:font-sans focus:border-sky-500/50 outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Valor Total (R$)</label>
                <input
                  type="number" placeholder="0.00" step="0.01"
                  value={form.nfValue} onChange={(e) => setForm((p) => ({ ...p, nfValue: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white font-mono placeholder:font-sans focus:border-sky-500/50 outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Previsão Entrega</label>
                <input
                  type="date"
                  value={form.expectedAt} onChange={(e) => setForm((p) => ({ ...p, expectedAt: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-sky-500/50 outline-none transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Itens */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-l-2 border-sky-500 pl-2">
                  Relação de Itens ({form.items.length})
                </h4>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-md text-xs font-bold transition-colors"
                >
                  <Plus size={14} /> Novo Item
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {form.items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[#121212] border border-[#333] rounded-xl relative group">
                    <div className="flex-1 min-w-[200px]">
                      <select
                        value={item.skuId}
                        onChange={(e) => {
                          const s = skus.find((sk: any) => sk.id === e.target.value);
                          setItem(i, "skuId", e.target.value);
                          if (s) setItem(i, "description", s.description ?? s.descricao);
                        }}
                        className="w-full p-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs text-white outline-none"
                      >
                        <option value="">Associar Produto/SKU...</option>
                        {skus.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.code ?? s.codigo} — {s.description ?? s.descricao}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <input
                        placeholder="Nome / Descrição"
                        value={item.description}
                        onChange={(e) => setItem(i, "description", e.target.value)}
                        className="w-full p-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs text-white outline-none placeholder:text-gray-600"
                      />
                    </div>
                    <div className="flex gap-3 sm:w-auto">
                      <div className="w-24">
                        <input
                          type="number" placeholder="Qtd" min={1}
                          value={item.expectedQuantity}
                          onChange={(e) => setItem(i, "expectedQuantity", e.target.value)}
                          className="w-full p-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs text-white font-mono outline-none"
                        />
                      </div>
                      <div className="w-28 relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">R$</span>
                        <input
                          type="number" placeholder="0.00" step="0.01"
                          value={item.unitCost}
                          onChange={(e) => setItem(i, "unitCost", e.target.value)}
                          className="w-full p-2.5 pl-8 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs text-white font-mono outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeItem(i)}
                        disabled={form.items.length === 1}
                        className={`p-2 rounded-lg flex items-center justify-center shrink-0 w-10 sm:w-auto ${
                          form.items.length === 1 
                            ? 'text-gray-700 cursor-not-allowed opacity-50' 
                            : 'text-red-400 hover:text-white hover:bg-red-500/20 bg-red-500/5 border border-red-500/20 transition-colors'
                        }`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#242424]">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:bg-[#222] transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold transition-all shadow-[0_4px_14px_rgba(56,189,248,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Salvar Pedido Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="bg-[#1a1a1a] border border-[#242424] rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 size={32} className="animate-spin text-sky-500" />
            <p className="text-gray-400 font-medium tracking-wide">Sincronizando base de dados...</p>
          </div>
        ) : pos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-[#161616] border border-[#242424] rounded-full flex items-center justify-center mb-6">
              <FileText size={32} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-200 mb-2">Nenhum pedido encontrado.</h3>
            <p className="text-gray-500 max-w-sm text-sm">
              Sua lista de compras está vazia no momento. Crie um novo pedido ou importe documentos Excel utilizando os botões acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#121212] text-gray-500 border-b border-[#242424]">
                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Nº NF</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Nº Pedido</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Fornecedor Principal</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Data Inclusão</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Qtd</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Valor Total</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Estado Atual</th>
                  <th className="w-20 px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {pos.map((po) => (
                  <React.Fragment key={po.id}>
                    <tr
                      onClick={() => toggle(po.id)}
                      className="hover:bg-[#ffffff05] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4 text-gray-600 group-hover:text-white transition-colors">
                        {expanded[po.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sky-400 font-bold bg-sky-400/10 px-2 py-1 rounded text-xs">
                          {po.nf_number ?? po.numero_nf ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-gray-300 text-sm">
                        {po.order_number ?? po.numero_pedido ?? po.pedido ?? po.id?.slice(0, 8) ?? "—"}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-200">
                        {po.supplier_name ?? po.fornecedor_nome ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                          <Clock size={14} className="text-gray-500" />
                          {new Date().toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-400">
                        <span className="font-bold text-gray-300">
                          {(po.items ?? po.itens ?? []).reduce((acc: number, item: any) => acc + Number(item.expected_quantity ?? item.quantidade_esperada ?? item.quantidade ?? 1), 0)}
                        </span> unid(s)
                      </td>
                      <td className="px-4 py-4 font-mono text-emerald-400">
                        {(() => {
                           const val = po.nf_value ?? po.valor_nf ?? (po.items ?? po.itens ?? []).reduce((acc: number, item: any) => acc + Number(item.unit_cost ?? item.custo_unitario ?? 0) * Number(item.expected_quantity ?? item.quantidade_esperada ?? item.quantidade ?? 1), 0);
                           return (typeof val === "number" && !isNaN(val)) ? `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";
                        })()}
                      </td>
                      <td className="px-4 py-4">
                        <Badge status={po.status} />
                      </td>
                      <td className="px-4 py-4 border-l border-[#242424]/50">
                        {po.status === "PENDING" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(po.id); }}
                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                            title="Cancelar Pedido"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        {po.status === "COMPLETED" && (
                          <div className="p-2 border border-emerald-500/20 bg-emerald-500/10 rounded-lg inline-flex" title="Fechado com sucesso">
                            <CheckCircle size={16} className="text-emerald-500" />
                          </div>
                        )}
                      </td>
                    </tr>
                    
                    {/* Linha Expandida (Itens) */}
                    {expanded[po.id] && (
                      <tr className="bg-[#121212]">
                        <td colSpan={9} className="p-0 border-t border-[#242424]/50">
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-4 bg-sky-500 rounded-full"></div>
                                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Detalhamento de Itens
                                </h5>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l border-[#242424]">
                              {(po.items ?? po.itens ?? []).map((item: any, idx: number) => (
                                <div key={idx} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex flex-col gap-3 hover:border-[#444] transition-colors">
                                  <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Cód. SKU</p>
                                        <span className="font-mono text-sm text-sky-400 bg-sky-400/5 px-2 py-0.5 rounded border border-sky-400/10 block w-fit">
                                        {item.sku_id ?? item.sku ?? "N/D"}
                                        </span>
                                    </div>
                                    <div className="px-2.5 py-1 bg-[#222] rounded-md border border-[#333] text-right">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Qtd Solic.</p>
                                        <span className="font-bold text-white text-base">
                                         {item.expected_quantity ?? item.quantidade}
                                        </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Nome/Apelido do Produto</p>
                                    <p className="text-sm font-medium text-gray-300 leading-tight">
                                        {item.sku_description ?? item.descricao ?? item.description ?? "Sem descrição registrada"}
                                    </p>
                                  </div>
                                  
                                  <div className="mt-auto pt-3 border-t border-[#333] flex justify-between items-center">
                                     <span className="text-xs text-gray-500 font-medium">Unidade Operacional: {item.unit ?? 'UN'}</span>
                                     <div className="text-right">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Custo Ref.</p>
                                        <p className="font-mono text-emerald-400 font-medium text-sm">
                                            R$ {Number(item.unit_cost ?? item.custo_unitario ?? 0).toFixed(2)}
                                        </p>
                                     </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Rodapé Tabela (Paginador) */}
        {!loading && pos.length > 0 && (
            <div className="flex justify-between items-center px-6 py-4 bg-[#121212] border-t border-[#242424] mt-auto">
                <span className="text-xs font-medium text-gray-500">
                    Exibindo bloco {page} (máx {PER_PAGE} docs)
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={pos.length < PER_PAGE}
                        className="px-4 py-2 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        )}
      </div>

      {excelRows && (
        <ExcelPreviewModal
          rows={excelRows}
          onConfirm={handleImportConfirm}
          onClose={() => { setExcelRows(null); setSelectedFile(null); }}
          importing={importing}
        />
      )}
    </div>
  );
}
