import { fDT } from '../../lib/format';
import { timeLeftLabel } from '../../lib/domain';

export default function BlockedBanner({ loan, toolName }) {
  if (!loan) return null;
  return (
    <div className="block-banner" role="alert">
      <strong>Pedidos bloqueados.</strong> A ferramenta <b>{toolName}</b> ({loan.id}) devia ter sido devolvida em{' '}
      {fDT(loan.dueAt)} ({timeLeftLabel(loan.dueAt)}). Devolva-a ao almoxarifado para voltar a fazer solicitações.
    </div>
  );
}
