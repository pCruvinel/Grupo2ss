// Função para gerar registros de ponto dos últimos 30 dias (RN-004)
function gerarRegistrosPonto30Dias() {
  const registros: any[] = [];
  const colaboradores = [
    { id: '1', nome: 'Rafael Souza' },
    { id: '2', nome: 'Carla Mendes' },
    { id: '3', nome: 'Lucas Oliveira' },
    { id: '4', nome: 'Juliana Costa' },
    { id: '5', nome: 'Fernando Lima' },
    { id: '6', nome: 'Patricia Alves' },
    { id: '7', nome: 'Ricardo Nunes' },
    { id: '8', nome: 'Camila Rocha' },
  ];

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  for (let dia = 0; dia < 30; dia++) {
    const dataAtual = new Date(hoje);
    dataAtual.setDate(dataAtual.getDate() - dia);
    const dataString = dataAtual.toISOString().split('T')[0];
    const diaSemana = dataAtual.getDay();
    
    // Pular finais de semana
    if (diaSemana === 0 || diaSemana === 6) continue;
    
    colaboradores.forEach((colab, index) => {
      const registroId = `ponto-${dia}-${index}-${Date.now()}`;
      
      // Simular diferentes padrões de ponto
      const variacaoEntrada = Math.random() > 0.8 ? 15 : 0; // 20% de chance de chegar 15 min atrasado
      const horaEntradaManha = variacaoEntrada > 0 ? '08:15' : '08:00';
      const horaSaidaAlmoco = '12:00';
      const horaEntradaTarde = Math.random() > 0.9 ? '13:15' : '13:00';
      
      // Variar hora de saída (70% sai no horário, 30% faz hora extra)
      const fazHoraExtra = Math.random() > 0.7;
      const horaSaidaTarde = fazHoraExtra ? '18:00' : '17:00';
      
      // Calcular horas trabalhadas
      const horasManha = 4 - (variacaoEntrada / 60);
      const horasTarde = fazHoraExtra ? 5 : 4;
      const atrasoAlmoco = horaEntradaTarde === '13:15' ? 0.25 : 0;
      const totalHoras = horasManha + horasTarde - atrasoAlmoco;
      const horasExtras = Math.max(0, totalHoras - 8);
      
      // Simular ausências aleatórias (3% de chance)
      if (Math.random() > 0.97) {
        registros.push({
          id: registroId,
          colaborador_id: colab.id,
          colaborador_nome: colab.nome,
          data: dataString,
          entrada_manha: null,
          saida_almoco: null,
          entrada_tarde: null,
          saida_tarde: null,
          horas_trabalhadas: 0,
          horas_extras: 0,
          observacao: 'Ausência justificada - Atestado médico',
          editado_por: null,
        });
      } 
      // Simular atrasos sem justificativa (2% de chance)
      else if (Math.random() > 0.98) {
        registros.push({
          id: registroId,
          colaborador_id: colab.id,
          colaborador_nome: colab.nome,
          data: dataString,
          entrada_manha: '09:30',
          saida_almoco: '12:00',
          entrada_tarde: '13:00',
          saida_tarde: '17:00',
          horas_trabalhadas: 6.5,
          horas_extras: 0,
          observacao: 'Atraso não justificado',
          editado_por: 'João Santos (RH)',
        });
      }
      // Registro normal
      else {
        const observacoes = [
          '',
          '',
          '',
          '',
          fazHoraExtra ? 'Projeto urgente - Cliente ABC' : '',
          fazHoraExtra ? 'Montagem de evento' : '',
          fazHoraExtra ? 'Entrega de equipamentos' : '',
        ];
        
        registros.push({
          id: registroId,
          colaborador_id: colab.id,
          colaborador_nome: colab.nome,
          data: dataString,
          entrada_manha: horaEntradaManha,
          saida_almoco: horaSaidaAlmoco,
          entrada_tarde: horaEntradaTarde,
          saida_tarde: horaSaidaTarde,
          horas_trabalhadas: parseFloat(totalHoras.toFixed(2)),
          horas_extras: parseFloat(horasExtras.toFixed(2)),
          observacao: observacoes[Math.floor(Math.random() * observacoes.length)],
          editado_por: variacaoEntrada > 0 || atrasoAlmoco > 0 ? 'João Santos (RH)' : null,
        });
      }
    });
  }
  
  return registros.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

// Exportar registros de ponto dos últimos 30 dias
export const MOCK_REGISTROS_PONTO_30_DIAS = gerarRegistrosPonto30Dias();
