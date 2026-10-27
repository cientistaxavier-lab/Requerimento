import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { alertList } from '../../lib/domain';

export default function AlertCenter({ onOpenItem }) {
  const { isGestor } = useAuth();
  const { data } = useData();
  const all = alertList(data, isGestor);
  const nb = all.filter((a) => a.k === 'bad').length;
  const nw = all.filter((a) => a.k === 'warn').length;
  const nt = all.filter((a) => a.k === 'watch').length;
  const shown = all.slice(0, 8);

  return (
    <section className="panel" style={{ marginBottom: 18 }}>
      <header>
        <h2>Central de alertas</h2>
        <div className="acts">
          <span className="pill p-out">{nb} críticos</span>
          <span className="pill p-wait">{nw} atenção</span>
          <span className="pill p-info">{nt} a monitorar</span>
        </div>
      </header>
      <div className="body">
        {all.length ? (
          <>
            <div className="alerts">
              {shown.map((a, i) => (
                <div className={'al ' + a.k} key={i}>
                  <i />
                  {a.id ? (
                    <button type="button" onClick={() => onOpenItem(a.id)}>
                      {a.t}
                    </button>
                  ) : (
                    <span>{a.t}</span>
                  )}
                </div>
              ))}
            </div>
            {all.length > 8 && <p className="note" style={{ marginTop: 8 }}>Mais {all.length - 8} alertas. A lista completa está em Reposição.</p>}
          </>
        ) : (
          <p className="muted">Nenhum alerta no momento. Estoque e pedidos dentro do esperado.</p>
        )}
      </div>
    </section>
  );
}
