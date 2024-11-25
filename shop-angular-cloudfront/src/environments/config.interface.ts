export type ApiEndpoint = 'product' | 'order' | 'import' | 'bff' | 'cart';

export interface Config {
  chatBotUrl: string;
  production: boolean;
  apiEndpoints: Record<ApiEndpoint, string>;
  apiEndpointsEnabled: Record<ApiEndpoint, boolean>;
}
