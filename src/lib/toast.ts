/**
 * Toast Notification Helper
 * Centraliza chamadas de toast do Sonner v2.0.3
 * 
 * USO PADRÃO:
 * import { toast } from '../lib/toast';
 * 
 * toast.success('Operação realizada!');
 * toast.error('Erro ao processar');
 * toast.warning('Atenção!');
 * toast.info('Informação importante');
 * toast.loading('Processando...');
 * 
 * CASOS ESPECIAIS:
 * 
 * 1. Toast com ação:
 * toast.success('Item criado!', {
 *   action: {
 *     label: 'Desfazer',
 *     onClick: () => handleUndo(),
 *   },
 * });
 * 
 * 2. Toast customizado:
 * toast.custom((t) => (
 *   <div className="p-4 bg-white rounded-lg shadow">
 *     Conteúdo customizado
 *   </div>
 * ));
 * 
 * 3. Toast com promessa (loading automático):
 * toast.promise(
 *   fetchData(),
 *   {
 *     loading: 'Carregando...',
 *     success: 'Dados carregados!',
 *     error: 'Erro ao carregar',
 *   }
 * );
 */

export { toast } from 'sonner@2.0.3';