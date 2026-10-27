import { useData } from '../../context/DataContext';
import { DAY } from '../../data/seed';
import { startOfDay, fD } from '../../lib/format';

export default function Chart14() {
  const { data } = useData();
  const today = startOfDay(Date.now());
  const days = [];
  for (let i = 13; i >= 0; i--) days.push(today - i * DAY);
  const inn = days.map(() => 0);
  const out = days.map(() => 0);
  data.movs.forEach((m) => {
    const idx = Math.round((startOfDay(m.ts) - days[0]) / DAY);
    if (idx < 0 || idx > 13) return;
    if (m.type === 'entrada') inn[idx]++;
    else if (m.type === 'saida') out[idx]++;
  });
  let mx = Math.max(...inn, ...out, 4);
  mx = Math.ceil(mx / 2) * 2;
  const W = 620, H = 210, pl = 30, pb = 26, pt = 10, gw = (W - pl) / 14, bw = gw * 0.32, ph = H - pb - pt;

  return (
    <>
      <div className="legend" style={{ marginBottom: 8 }}>
        <span>
          <i style={{ background: 'var(--ok)' }} />
          Entradas
        </span>
        <span>
          <i style={{ background: 'var(--brand)' }} />
          Saídas
        </span>
      </div>
      <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" role="img" aria-label="Entradas e saídas por dia nos últimos 14 dias">
        {[0, 0.5, 1].map((f) => {
          const y = pt + ph - ph * f;
          return (
            <g key={f}>
              <line className="gl" x1={pl} x2={W} y1={y} y2={y} />
              <text className="ax" x={pl - 6} y={y + 4} textAnchor="end">
                {Math.round(mx * f)}
              </text>
            </g>
          );
        })}
        {days.map((d, k) => {
          const x = pl + k * gw + gw * 0.14;
          const hi = (ph * inn[k]) / mx;
          const ho = (ph * out[k]) / mx;
          return (
            <g key={d}>
              <rect className="c-in" x={x} y={pt + ph - hi} width={bw} height={hi} rx="2">
                <title>{fD(d) + ': ' + inn[k] + ' entradas'}</title>
              </rect>
              <rect className="c-out" x={x + bw + 2} y={pt + ph - ho} width={bw} height={ho} rx="2">
                <title>{fD(d) + ': ' + out[k] + ' saídas'}</title>
              </rect>
              <text className="ax" x={x + bw} y={H - 8} textAnchor="middle">
                {new Date(d).getDate()}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}
