import { fmtN } from '../../lib/format';
import { stLabel } from '../../lib/domain';

export function Head({ title, sub, actions }) {
  return (
    <div className="head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="acts">{actions}</div>
    </div>
  );
}

export function Pill({ status }) {
  return <span className={'pill p-' + status}>{stLabel[status]}</span>;
}

export function HBars({ data, fmt }) {
  if (!data.length) return <p className="muted">Sem dados no período.</p>;
  const mx = Math.max(1, ...data.map((d) => d.value));
  return (
    <>
      {data.map((d, i) => (
        <div className="hb" key={i}>
          <span className="hl" title={d.label}>
            {d.label}
          </span>
          <span className="track">
            <i style={{ width: (d.value > 0 ? Math.max(2, (d.value / mx) * 100) : 0) + '%' }} />
          </span>
          <span className="hv">{fmt ? fmt(d) : fmtN(d.value)}</span>
        </div>
      ))}
    </>
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
