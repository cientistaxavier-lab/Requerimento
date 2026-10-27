import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Head, HBars, Empty } from '../common/ui';
import { REPORTS } from '../../lib/reports';
import { fmtN } from '../../lib/format';
import { toCSV, downloadCSV } from '../../lib/csv';

export default function Relatorios() {
  const { data } = useData();
  const { show } = useToast();
  const [id, setId] = useState('posicao');
  const [days, setDays] = useState(30);

  const report = REPORTS.find((r) => r.id === id);
  const out = useMemo(() => report.fn(data, days), [report, data, days]);

  function exportCSV() {
    const ok = downloadCSV('relatorio-' + id + '.csv', toCSV(out.cols, out.rows));
    show(ok ? 'Arquivo baixado.' : 'Não foi possível salvar o arquivo.', ok ? undefined : 'err');
  }

  return (
    <>
      <Head title="Relatórios" sub={REPORTS.length + ' visões prontas da operação (estoque e ferramentas). Escolha o relatório, o período e exporte para planilha.'} />
      <div className="rel">
        <nav className="panel relnav" aria-label="Relatórios">
          {REPORTS.map((r) => (
            <button key={r.id} type="button" aria-pressed={r.id === id} onClick={() => setId(r.id)}>
              <b>{r.t}</b>
              <span>{r.d}</span>
            </button>
          ))}
        </nav>
        <section className="panel">
          <header>
            <h2>{report.t}</h2>
            <div className="rel-tools">
              {report.period && (
                <select aria-label="Período" value={days} onChange={(e) => setDays(+e.target.value)}>
                  <option value={7}>Últimos 7 dias</option>
                  <option value={30}>Últimos 30 dias</option>
                  <option value={90}>Últimos 90 dias</option>
                </select>
              )}
              <button className="btn" type="button" onClick={exportCSV}>
                Exportar planilha
              </button>
            </div>
          </header>
          <div className="body">
            <div className="sum">
              {out.summary.map((s, i) => (
                <div key={i}>
                  <div className="v">{s.v}</div>
                  <div className="l">{s.l}</div>
                </div>
              ))}
            </div>
            {out.chart && out.chart.data.length > 0 && (
              <>
                <h3 style={{ fontSize: 19, marginBottom: 6 }}>{out.chart.title}</h3>
                <HBars data={out.chart.data} fmt={out.chart.fmt} />
                <div style={{ height: 14 }} />
              </>
            )}
            {out.rows.length ? (
              <>
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        {out.cols.map((c, i) => (
                          <th key={i} className={c.num ? 'n' : undefined}>
                            {c.h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {out.rows.map((r, ri) => (
                        <tr key={ri}>
                          {r.map((v, ci) => {
                            const c = out.cols[ci];
                            const t = c.f && v !== '' ? c.f(v) : c.num && typeof v === 'number' ? fmtN(v) : v;
                            return (
                              <td key={ci} className={c.num ? 'n' : undefined}>
                                {t}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="foot muted">{out.rows.length} linhas</div>
              </>
            ) : (
              <Empty>Nenhum registro para este relatório no período.</Empty>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
