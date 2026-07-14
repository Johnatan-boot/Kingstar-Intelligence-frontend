const fs = require('fs');
const file = 'src/apps/mfe-compras/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldHeaders = `                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Nº Documento / Pedido</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Fornecedor Principal</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Data Inclusão</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Volume Itens</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Valor Total</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Estado Atual</th>
                  <th className="w-20 px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Ações</th>
                </tr>`;

const newHeaders = `                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Nº NF</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Nº Pedido</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Fornecedor Principal</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Data Inclusão</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Qtd</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Valor Total</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Estado Atual</th>
                  <th className="w-20 px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Ações</th>
                </tr>`;

content = content.replace(oldHeaders, newHeaders);

const oldCells = `                      <td className="px-4 py-4">
                        <span className="font-mono text-sky-400 font-bold bg-sky-400/10 px-2 py-1 rounded text-xs">
                          {po.nf_number ?? po.numero_nf ?? po.id?.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-200">
                        {po.supplier_name ?? po.fornecedor_nome ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                          <Clock size={14} className="text-gray-500" />
                          {new Date(po.ordered_at ?? po.created_at ?? po.criado_em ?? new Date()).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-400">
                        <span className="font-bold text-gray-300">{(po.items ?? po.itens ?? []).length}</span> unid(s)
                      </td>
                      <td className="px-4 py-4 font-mono text-emerald-400">
                        {(po.nf_value ?? po.valor_nf)
                          ? \`R$ \${Number(po.nf_value ?? po.valor_nf).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\`
                          : "—"}
                      </td>`;

const newCells = `                      <td className="px-4 py-4">
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
                           return val > 0 ? \`R$ \${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\` : "—";
                        })()}
                      </td>`;

content = content.replace(oldCells, newCells);

// Expanded row column span update
content = content.replace(/<td colSpan=\{8\} className="p-0 border-t border-\[\#242424\]\/50">/, '<td colSpan={9} className="p-0 border-t border-[#242424]/50">');

fs.writeFileSync(file, content);
