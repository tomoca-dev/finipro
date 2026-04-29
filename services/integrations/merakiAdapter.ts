import { getIntegrationDevices } from './integrationGateway';

export const getMerakiStyleHealth = async () => {
  const devices = await getIntegrationDevices();
  const online = devices.filter((device) => device.status === 'ONLINE').length;
  const degraded = devices.filter((device) => device.status === 'DEGRADED' || device.status === 'SYNCING').length;
  const offline = devices.filter((device) => device.status === 'OFFLINE').length;

  return {
    storesCovered: new Set(devices.map((device) => device.store)).size,
    online,
    degraded,
    offline,
    fleetHealth: devices.length > 0 ? Math.round(((online + degraded * 0.5) / devices.length) * 100) : 100,
    devices,
  };
};
