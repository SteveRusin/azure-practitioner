import { Config } from './config.interface';

const url = 'https://fa-products-service-sand-ne-001.azurewebsites.net/api'

export const environment: Config = {
  production: true,
  apiEndpoints: {
    product: url,
    order: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    import: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    bff: url,
    cart: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
  },
  apiEndpointsEnabled: {
    product: true,
    order: false,
    import: false,
    bff: true,
    cart: false,
  },
};
