import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

/**
 * The endor backend plugin 
 * @public
 */
export const endorBackendPlugin = createBackendPlugin({
  pluginId: 'endor-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        http: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ http, logger, config }) {
        http.use(
          await createRouter({
            logger: loggerToWinstonLogger(logger),
            config,
          }),
        );
        http.addAuthPolicy({
          path: '*',
          allow: 'unauthenticated',
        });
      },
    });
  },
});