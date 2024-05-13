import { 
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { EndorBackendClient } from './api/EndorBackendClient';

import { endorApiRef } from './types';
import { rootRouteRef } from './routes';

export const endorFrontendPlugin = createPlugin({
  id: 'endor',
  apis: [
    createApiFactory({
      api: endorApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) =>
        new EndorBackendClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const EndorFrontendPage = endorFrontendPlugin.provide(
  createRoutableExtension({
    name: 'EndorFrontendPage',
    component: () =>
      import('./components/EndorComponent').then(m => m.EndorComponent),
    mountPoint: rootRouteRef,
  }),
);
