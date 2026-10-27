import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Head, Pill, Empty } from '../common/ui';
import { reposRows, fmtCov } from '../../lib/domain';
import { fmtN, brl } from '../../lib/format';
import { toCSV, downloadCSV } from '../../lib/csv';

export default function Reposicao() {
  const { data } = useData();
  const { show } = useToast();
  const rows = useMemo(() => reposRows(data), [data]);
  const [sel, setSel] = useState(() => new Set(rows.map((r) => r.it.id)));

  function toggle(id) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportCSV() {
    const chosen = rows.filter((r) => sel.has(r.it.id));
    if (!chosen.length) return show('Selecione ao menos um item.', 'err');
    const cols = [{ h: 'Código' }, { h: 'Item' }, { h: 'Unidade' }, { h: 'Saldo' }, { h: 'Quantidade a comprar' }, { h: 'Custo unitário' }, { h: 'Custo estimado' }];
    const ok = downloadCSV('lista-de-compra.csv', toCSV(cols, chosen.map((r) => [r.it.code, r.it.name, r.it.unit, r.it.qty, r.buy, r.it.cost, Math.round(r.buy * r.it.cost * 100) / 100])));
    show(ok ? 'Arquivo baixado.' : 'Não foi possível salvar o arquivo.', ok ? undefined : 'err');
  }

  let tot = 0;
  let n = 0;
  rows.forEach((r) => {
    if (sel.has(r.it.id)) {
      tot += r.buy * r.it.cost;
      n++;
    }
  });

  return (
    <>
      <Head
        title="Reposição"
        sub="O que está abaixo do mínimo, quantos dias o saldo ainda dura e quanto comprar para chegar ao máximo."
        actions={
          <button className="btn primary" type="button" onClick={exportCSV} disabled={!rows.length}>
            Exportar lista de compra
          </button>
        }
      />
      <section className="panel">
        <header>
          <h2>Itens para repor</h2>
          <span className="muted">Cobertura = saldo dividido pelo consumo médio diário dos últimos 30 dias</span>
        </header>
        {rows.length ? (
          <>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Item</th>
                    <th className="n">Saldo</th>
                    <th className="n">Mínimo</th>
                    <th>Cobertura</th>
                    <th className="n">Sugestão de compra</th>
                    <th className="n">Custo estimado</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const s = r.it.qty <= 0 ? 'out' : r.it.qty < r.it.min ? 'low' : 'ok';
                    return (
                      <tr key={r.it.id}>
                        <td>
                          <input type="checkbox" checked={sel.has(r.it.id)} onChange={() => toggle(r.it.id)} aria-label={'Incluir ' + r.it.name + ' na lista'} />
                        </td>
                        <td>
                          <span className="code">{r.it.code}</span> {r.it.name}
                        </td>
                        <td className="n">{fmtN(r.it.qty)}</td>
                        <td className="n">{r.it.min}</td>
                        <td>{fmtCov(r.cov)}</td>
                        <td className="n">
                          {fmtN(r.buy)} {r.it.unit}
                        </td>
                        <td className="n">{brl(r.buy * r.it.cost)}</td>
                        <td>
                          <Pill status={s} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="foot">
              <b>{n}</b> itens selecionados, custo estimado de <b>{brl(tot)}</b>.
            </div>
          </>
        ) : (
          <Empty>Nenhum item abaixo do mínimo. Nada a repor agora.</Empty>
        )}
      </section>
    </>
  );
}
