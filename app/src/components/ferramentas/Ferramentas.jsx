import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Head, Empty } from '../common/ui';
import { brl } from '../../lib/format';
import { TOOL_CATS, TOOL_STATUS_LABEL } from '../../data/seed';
import { useToolModals } from './useToolModals';
import ToolModals from './ToolModals';

const STATUS_PILL = { disponivel: 'p-ok', emprestada: 'p-info', manutencao: 'p-wait' };

export default function Ferramentas() {
  const { isGestor } = useAuth();
  const { data } = useData();
  const tm = useToolModals();
  const [cat, setCat] = useState('');
  const [st, setSt] = useState('');

  const list = useMemo(
    () => data.tools.filter((t) => (!cat || t.cat === cat) && (!st || t.status === st)).sort((a, b) => a.patrimonio.localeCompare(b.patrimonio)),
    [data.tools, cat, st]
  );

  return (
    <>
      <Head
        title="Ferramentas"
        sub="Catálogo de ferramentas com patrimônio, emprestadas por colaborador em vez de consumidas."
        actions={
          isGestor && (
            <button className="btn primary" type="button" onClick={tm.openNewTool}>
              Nova ferramenta
            </button>
          )
        }
      />
      <section className="panel">
        <header>
          <div className="filters">
            <select aria-label="Categoria" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Todas as categorias</option>
              {TOOL_CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select aria-label="Situação" value={st} onChange={(e) => setSt(e.target.value)}>
              <option value="">Todas as situações</option>
              <option value="disponivel">Disponível</option>
              <option value="emprestada">Emprestada</option>
              <option value="manutencao">Em manutenção</option>
            </select>
          </div>
        </header>
        {list.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Patrimônio</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th className="n">Custo de reposição</th>
                  <th>Situação</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="code">{t.patrimonio}</span>
                    </td>
                    <td>{t.name}</td>
                    <td>{t.cat}</td>
                    <td className="n">{brl(t.cost)}</td>
                    <td>
                      <span className={'pill ' + STATUS_PILL[t.status]}>{TOOL_STATUS_LABEL[t.status]}</span>
                    </td>
                    <td className="ac">
                      <button className="btn sm" type="button" onClick={() => tm.openToolHistory(t.id)}>
                        Histórico
                      </button>{' '}
                      {isGestor && (
                        <>
                          <button className="btn sm" type="button" onClick={() => tm.openEditTool(t.id)}>
                            Editar
                          </button>{' '}
                          <button className="btn sm" type="button" onClick={() => tm.askDeleteTool(t.id)}>
                            Excluir
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nenhuma ferramenta encontrada.</Empty>
        )}
      </section>
      <ToolModals {...tm} />
    </>
  );
}
