import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { stOf } from '../../lib/domain';
import { fmtN, brl } from '../../lib/format';
import { Head, Pill, Empty } from '../common/ui';
import { CATS } from '../../data/seed';
import { useItemModals } from './useItemModals';
import ItemModals from './ItemModals';
import NewItemModal from './NewItemModal';

export default function Estoque() {
  const { data } = useData();
  const im = useItemModals();
  const [newOpen, setNewOpen] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [st, setSt] = useState('');

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.items
      .filter((i) => (!cat || i.cat === cat) && (!st || stOf(i) === st) && (!query || (i.name + ' ' + i.code + ' ' + i.loc).toLowerCase().includes(query)))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data.items, q, cat, st]);

  return (
    <>
      <Head
        title="Estoque"
        sub="Tudo o que existe no almoxarifado, onde está e se o saldo está saudável."
        actions={
          <button className="btn primary" type="button" onClick={() => setNewOpen(true)}>
            Novo item
          </button>
        }
      />
      <section className="panel">
        <header>
          <div className="filters">
            <input type="search" placeholder="Buscar por nome, código ou posição" aria-label="Buscar item" value={q} onChange={(e) => setQ(e.target.value)} />
            <select aria-label="Categoria" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Todas as categorias</option>
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select aria-label="Situação" value={st} onChange={(e) => setSt(e.target.value)}>
              <option value="">Todas as situações</option>
              <option value="ok">Normal</option>
              <option value="low">Abaixo do mínimo</option>
              <option value="out">Ruptura</option>
            </select>
          </div>
        </header>
        {list.length ? (
          <>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Item</th>
                    <th>Categoria</th>
                    <th>Posição</th>
                    <th>Saldo</th>
                    <th className="n">Mín. / máx.</th>
                    <th>Situação</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((i) => {
                    const s = stOf(i);
                    const pct = Math.max(0, Math.min(100, Math.round((i.qty / i.max) * 100)));
                    return (
                      <tr key={i.id}>
                        <td>
                          <span className="code">{i.code}</span>
                        </td>
                        <td>
                          {i.name}
                          <div className="sub">
                            {i.unit}, custo {brl(i.cost)}
                          </div>
                        </td>
                        <td>{i.cat}</td>
                        <td>{i.loc}</td>
                        <td>
                          <div className="lvl">
                            <span>
                              <b>{fmtN(i.qty)}</b> {i.unit}
                            </span>
                            <span className="track">
                              <i className={'c-' + s} style={{ width: pct + '%' }} />
                            </span>
                          </div>
                        </td>
                        <td className="n">
                          {i.min} / {i.max}
                        </td>
                        <td>
                          <Pill status={s} />
                        </td>
                        <td className="ac">
                          <button className="btn sm" type="button" onClick={() => im.openQuick(i.id, 'entrada')}>
                            Entrada
                          </button>{' '}
                          <button className="btn sm" type="button" onClick={() => im.openQuick(i.id, 'saida')}>
                            Saída
                          </button>{' '}
                          <button className="btn sm" type="button" onClick={() => im.openItem(i.id)}>
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="foot muted">
              {list.length} de {data.items.length} itens
            </div>
          </>
        ) : (
          <Empty>Nenhum item encontrado. Ajuste a busca ou os filtros.</Empty>
        )}
      </section>
      <ItemModals {...im} />
      <NewItemModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  );
}
