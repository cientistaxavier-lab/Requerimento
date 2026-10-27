export const OPERATORS=['Rafael Nunes','Juliana Castro','Marcos Vidal','Patrícia Lemos','Diego Farias'];
export const SECTORS=['Expedição','Recebimento','Manutenção','Produção','Administrativo','TI'];
export const CATS=['EPI','Embalagem','Escritório','Limpeza','Manutenção','TI'];
export const UNITS=['un','par','cx','rolo','resma','pct','kg','L'];
export const CCS=[['CC-101','Expedição'],['CC-102','Recebimento'],['CC-201','Manutenção'],['CC-301','Produção'],['CC-401','Administrativo'],['CC-402','TI']];
export const CCOF={'Expedição':'CC-101','Recebimento':'CC-102','Manutenção':'CC-201','Produção':'CC-301','Administrativo':'CC-401','TI':'CC-402'};
export const ROLES={gestor:'Gestor do almoxarifado',almox:'Almoxarife',solic:'Solicitante'};
export const PANEL_OF=function(role){return role==='solic'?'solic':'almox';};
export const DAY=86400000;
export const TOOL_CATS=['Elétricas','Manuais','Medição','Elevação e içamento','Equipamento de proteção'];
export const TOOL_STATUS_LABEL={disponivel:'Disponível',emprestada:'Emprestada',manutencao:'Em manutenção'};

function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function pad(n,l){return String(n).padStart(l,'0');}

var RAW=[
['EPI-001','Luva de segurança vaqueta','EPI','par',40,200,86,18.5],
['EPI-002','Capacete de segurança branco','EPI','un',15,60,12,32],
['EPI-003','Óculos de proteção incolor','EPI','un',30,120,74,9.9],
['EPI-004','Protetor auricular plug','EPI','par',100,400,0,1.8],
['EPI-005','Colete refletivo','EPI','un',20,80,41,24],
['EPI-006','Bota de segurança nº 42','EPI','par',6,24,5,89],
['EMB-001','Fita adesiva transparente 48 mm','Embalagem','rolo',120,600,340,3.9],
['EMB-002','Filme stretch 500 mm','Embalagem','rolo',40,160,28,42],
['EMB-003','Caixa de papelão 40x30x30','Embalagem','un',200,1000,615,4.2],
['EMB-004','Etiqueta térmica 100x150','Embalagem','rolo',25,100,19,31],
['EMB-005','Ribbon de resina 110 mm','Embalagem','un',10,40,22,38],
['EMB-006','Cinta de amarração 5 m','Embalagem','un',15,60,34,27],
['EMB-007','Pallet PBR de madeira','Embalagem','un',30,120,88,48],
['ESC-001','Papel A4 75 g','Escritório','resma',30,120,54,26],
['ESC-002','Caneta esferográfica azul','Escritório','cx',5,20,9,24],
['ESC-003','Toner para impressora laser','Escritório','un',4,14,3,310],
['ESC-004','Pasta suspensa','Escritório','un',20,100,60,2.4],
['LIM-001','Detergente neutro 5 L','Limpeza','un',6,24,15,21],
['LIM-002','Saco de lixo 100 L','Limpeza','pct',10,40,26,17],
['LIM-003','Papel toalha interfolhado','Limpeza','cx',8,32,4,46],
['MAN-001','Lâmpada LED 18 W','Manutenção','un',20,80,47,12],
['MAN-002','Extensão elétrica 10 m','Manutenção','un',5,20,11,39],
['MAN-003','Disco de corte 7 pol','Manutenção','un',25,100,6,8.5],
['MAN-004','Graxa multiuso 500 g','Manutenção','un',6,24,13,28],
['MAN-005','Parafuso sextavado M8 (cx 100)','Manutenção','cx',10,40,22,34],
['TI-001','Cabo de rede Cat6 2 m','TI','un',15,60,38,11],
['TI-002','Leitor de código de barras','TI','un',2,8,3,240],
['TI-003','Mouse USB','TI','un',5,20,1,29]
];
var CORR={'EPI':'A','Embalagem':'B','Escritório':'C','Limpeza':'C','Manutenção':'D','TI':'D'};

var RAW_TOOLS=[
['PAT-0101','Furadeira de impacto 127V','Elétricas',480],
['PAT-0102','Parafusadeira a bateria','Elétricas',420],
['PAT-0103','Esmerilhadeira angular 4,5 pol','Elétricas',390],
['PAT-0104','Soldadora inversora 200A','Elétricas',1850],
['PAT-0201','Jogo de chaves combinadas 8-19mm','Manuais',260],
['PAT-0202','Chave de torque 1/2 pol','Manuais',340],
['PAT-0203','Marreta 2 kg','Manuais',70],
['PAT-0204','Talhadeira e jogo de ponteiros','Manuais',90],
['PAT-0301','Paquímetro digital 150mm','Medição',180],
['PAT-0302','Multímetro digital','Medição',210],
['PAT-0303','Trena a laser 50m','Medição',640],
['PAT-0401','Talha manual de corrente 1 ton','Elevação e içamento',890],
['PAT-0402','Cinto de segurança tipo paraquedista','Equipamento de proteção',320]
];

function toolSeed(r, now){
  var tools=RAW_TOOLS.map(function(x,i){return {id:'t'+(i+1),patrimonio:x[0],name:x[1],cat:x[2],cost:x[3],status:'disponivel'};});
  var byPat={};tools.forEach(function(t){byPat[t.patrimonio]=t.id;});
  var who={'Bruno Lima':'Manutenção','Thiago Souza':'Recebimento','Fernanda Alves':'Produção'};
  var loans=[];
  var mk=function(ago,name,patCode,hoursAgo,approvedHours,reason,status,extra){
    var ts=now-ago*DAY-Math.floor(r()*3*3600000);
    var o={id:'EMP-'+pad(loans.length+1,4),toolId:byPat[patCode],requester:name,sector:who[name],cc:CCOF[who[name]],reason:reason,requestedHours:approvedHours,approvedHours:0,ts:ts,status:status,decidedBy:'',decidedAt:0,rejectReason:'',deliveredAt:0,deliveredBy:'',dueAt:0,returnedAt:0,returnedBy:''};
    if(status!=='Pendente'){
      o.approvedHours=approvedHours;
      o.decidedBy=OPERATORS[Math.floor(r()*OPERATORS.length)];
      o.decidedAt=ts+(1+Math.floor(r()*2))*3600000;
    }
    if(status==='Emprestada'||status==='Devolvida'){
      o.deliveredAt=o.decidedAt+Math.floor(r()*3600000);
      o.deliveredBy=o.decidedBy;
      o.dueAt=o.deliveredAt+approvedHours*3600000;
    }
    if(status==='Devolvida'){
      o.returnedAt=now-hoursAgo*3600000;
      o.returnedBy=o.decidedBy;
    }
    if(extra)Object.keys(extra).forEach(function(k){o[k]=extra[k];});
    loans.push(o);
    if(status==='Emprestada')tools.find(function(t){return t.id===o.toolId;}).status='emprestada';
  };
  mk(5,'Thiago Souza','PAT-0303',0,4,'Conferência de layout do novo corredor','Devolvida',{});
  mk(2,'Fernanda Alves','PAT-0101',0,4,'Fixação de suportes na linha 3','Devolvida',{});
  mk(0,'Bruno Lima','PAT-0104',0,6,'Solda emergencial no portão da doca','Emprestada',{}); // dueAt no passado -> atrasada
  mk(0,'Thiago Souza','PAT-0302',0,3,'Verificação elétrica do painel novo','Emprestada',{}); // dentro do prazo
  mk(0,'Fernanda Alves','PAT-0202','',4,'Aperto de parafusos da bancada nova','Pendente',{});
  // força o primeiro empréstimo (solda) a já estar atrasado há cerca de 2h, e o segundo (multímetro) a vencer em breve
  loans[2].dueAt = now - 2*3600000;
  loans[3].dueAt = now + 35*60000;
  return {tools:tools,loans:loans};
}

export function seed(){
  var r=rng(20260918), now=Date.now(), items=[], cnt={}, tot={};
  RAW.forEach(function(x){tot[CORR[x[2]]]=(tot[CORR[x[2]]]||0)+1;});
  RAW.forEach(function(x,i){
    var c=CORR[x[2]]; cnt[c]=cnt[c]||0;
    var slot=Math.floor(cnt[c]*18/tot[c]); cnt[c]++;
    items.push({id:'i'+(i+1),code:x[0],name:x[1],cat:x[2],unit:x[3],min:x[4],max:x[5],qty:x[6],cost:x[7],loc:c+((slot%6)+1)+'-'+(Math.floor(slot/6)+1)});
  });
  var w=items.map(function(){return Math.pow(r(),2.2)+.08;});
  var wt=w.reduce(function(a,b){return a+b;},0);
  var pick=function(){var x=r()*wt;for(var i=0;i<w.length;i++){x-=w[i];if(x<=0)return items[i];}return items[0];};
  var movs=[];
  for(var d=30;d>=0;d--){
    var base=new Date(now-d*DAY);
    if(d>0&&base.getDay()===0)continue;
    var n=(base.getDay()===6?2:4)+Math.floor(r()*5);
    for(var k=0;k<n;k++){
      var it=pick(), isIn=r()<.24;
      var q=Math.max(1,Math.round(isIn?it.max*(.25+r()*.35):it.max*(.03+r()*.10)));
      var ts=new Date(base);
      if(d===0){ts=new Date(now-Math.floor(r()*6*3600000));}
      else{ts.setHours(7+Math.floor(r()*10),Math.floor(r()*60),0,0);}
      var sec=isIn?'':SECTORS[Math.floor(r()*SECTORS.length)];
      movs.push({id:'',ts:ts.getTime(),type:isIn?'entrada':'saida',itemId:it.id,delta:isIn?q:-q,who:OPERATORS[Math.floor(r()*OPERATORS.length)],ref:isIn?('NF '+(4200+Math.floor(r()*800))):'',sector:sec,cc:sec?CCOF[sec]:'',note:''});
    }
  }
  movs.sort(function(a,b){return a.ts-b.ts;}).forEach(function(m,i){m.id='M'+pad(i+1,4);});

  var byCode={};items.forEach(function(i){byCode[i.code]=i.id;});
  var who={
    'Bruno Lima':'Manutenção','Camila Rocha':'Expedição','Thiago Souza':'Recebimento',
    'Larissa Prado':'Administrativo','Igor Matos':'TI','Fernanda Alves':'Produção'
  };
  var reqs=[];
  var mk=function(ago,name,urg,lines,reason,status,extra){
    var ts=now-ago*DAY-Math.floor(r()*4*3600000)-(ago===0?3600000:0);
    var o={id:'SOL-'+pad(reqs.length+1,4),ts:ts,requester:name,sector:who[name],cc:CCOF[who[name]],urgency:urg,items:lines.map(function(l){return {id:byCode[l[0]],qty:l[1]};}),reason:reason,status:status,l1By:'',l1At:0,decidedBy:'',decidedAt:0,rejectReason:'',deliveredAt:0,deliveredBy:''};
    if(status==='Aguardando gestor'){o.l1By=OPERATORS[1];o.l1At=ts+2*3600000;}
    if(status!=='Pendente'&&status!=='Aguardando gestor'){
      o.decidedBy=OPERATORS[Math.floor(r()*OPERATORS.length)];
      o.decidedAt=ts+(1+Math.floor(r()*5))*3600000;
      o.l1By=o.decidedBy;o.l1At=o.decidedAt;
    }
    if(status==='Entregue'){o.deliveredAt=o.decidedAt+(1+Math.floor(r()*8))*3600000;o.deliveredBy=o.decidedBy;}
    if(extra)Object.keys(extra).forEach(function(k){o[k]=extra[k];});
    reqs.push(o);
  };
  mk(24,'Camila Rocha','Normal',[['EMB-002',6],['EMB-004',4]],'Reposição semanal da linha de expedição','Entregue');
  mk(21,'Bruno Lima','Normal',[['MAN-001',10],['MAN-002',2]],'Troca de iluminação do galpão 2','Entregue');
  mk(18,'Fernanda Alves','Urgente',[['EPI-001',30],['EPI-003',20]],'Novos colaboradores na linha de produção','Entregue');
  mk(16,'Larissa Prado','Normal',[['ESC-001',10],['ESC-003',1]],'Consumo mensal do administrativo','Entregue');
  mk(14,'Igor Matos','Normal',[['TI-003',3]],'Substituição de mouses com defeito','Recusada',{rejectReason:'Item abaixo do mínimo. Prioridade para a reposição antes de novas saídas.'});
  mk(12,'Thiago Souza','Urgente',[['EPI-004',50],['EPI-005',6]],'Equipe extra no recebimento de carga','Entregue');
  mk(9,'Bruno Lima','Normal',[['MAN-003',12],['MAN-004',3]],'Manutenção de esteiras','Entregue');
  mk(7,'Camila Rocha','Normal',[['EMB-003',100],['EMB-007',10]],'Montagem de pedidos da semana','Entregue');
  mk(6,'Larissa Prado','Normal',[['LIM-003',4],['LIM-002',6]],'Reposição dos banheiros','Entregue');
  mk(4,'Fernanda Alves','Normal',[['EPI-002',8]],'Capacetes para nova célula','Recusada',{rejectReason:'Quantidade acima da cota mensal do setor. Reenviar com aprovação do gestor.'});
  mk(3,'Igor Matos','Normal',[['TI-001',6]],'Cabeamento do novo ponto de rede','Entregue');
  mk(2,'Bruno Lima','Urgente',[['MAN-005',5],['MAN-004',2]],'Reparo urgente no portão da doca','Aprovada');
  mk(1,'Camila Rocha','Urgente',[['EMB-007',20]],'Pallets para o embarque extra de sexta-feira','Aguardando gestor');
  mk(0,'Igor Matos','Normal',[['TI-002',4]],'Novo posto de conferência de volumes','Pendente');
  mk(0,'Thiago Souza','Normal',[['EPI-006',3],['EPI-002',4]],'Equipamentos para dois novos conferentes','Pendente');
  mk(0,'Bruno Lima','Normal',[['MAN-001',15]],'Manutenção preventiva do galpão 1','Pendente');

  var users=[];
  var slug=function(n){return n.split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();};
  var addU=function(u,name,role,sector){users.push({user:u,name:name,role:role,sector:sector||'',active:true,pw0:u+'123',salt:'',hash:''});};
  addU('gestor','Helena Duarte','gestor');
  OPERATORS.forEach(function(n){addU(slug(n),n,'almox');});
  Object.keys(who).forEach(function(n){addU(slug(n),n,'solic',who[n]);});

  var tl=toolSeed(r, now);

  return {v:3,items:items,movs:movs,reqs:reqs,users:users,limit:500,tools:tl.tools,toolLoans:tl.loans};
}

