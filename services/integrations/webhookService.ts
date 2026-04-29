import { getIntegrationEvents } from './integrationGateway';

export const getWebhookCatalog = () => [
  'sale.created',
  'refund.created',
  'void.created',
  'shift.closed',
  'zreport.generated',
  'drawer.counted',
  'inventory.updated',
  'journal.exported',
];

export const getWebhookStats = async () => {
  const events = await getIntegrationEvents();
  const delivered = events.filter((event) => event.status === 'DELIVERED').length;
  const failed = events.filter((event) => event.status === 'FAILED').length;
  const queued = events.filter((event) => event.status === 'QUEUED').length;

  return {
    delivered,
    failed,
    queued,
    successRate: events.length > 0 ? Math.round((delivered / events.length) * 100) : 100,
  };
};
