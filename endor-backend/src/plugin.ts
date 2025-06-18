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
        logger.info('Endor backend plugin initializing');
        http.use(
          await createRouter({
            logger,
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