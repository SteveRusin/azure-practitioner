import { Config } from './config.interface';

const url = 'https://fa-products-service-sand-ne-001.azurewebsites.net/api';
const importUrl =
  'https://fa-imports-service-sand-ne-001.azurewebsites.net/api';

export const environment: Config = {
  production: true,
  chatBotUrl: 'https://myuniqprefix-chatbot-ca-dh-003.blackground-982cbc4c.northeurope.azurecontainerapps.io/api/chat',
  apiEndpoints: {
    product: url,
    order: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    import: importUrl,
    bff: url,
    cart: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
  },
  apiEndpointsEnabled: {
    product: false,
    order: false,
    import: false,
    bff: false,
    cart: false,
  },
};
