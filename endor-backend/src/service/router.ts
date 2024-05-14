import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { EndorService } from './endor.service';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface RouterOptions {
  logger: LoggerService;
  config: Config; // app-config
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  const apiUrl = config.getString('endor.apiUrl');
  const apiKey = config.getString('endor.apiKey');
  const apiSecret = config.getString('endor.apiSecret');

  const endorSVC = new EndorService({ apiUrl: apiUrl, apiKey, apiSecret });

  router.get('/health', (_req, res) => {
    res.status(200).send({ status: 'ok', apiURL: apiUrl });
  });

  router.get('/namespaces/:namespace/summary/:projectUUID', async (req, res) => {
    const { namespace, projectUUID } = req.params;

    logger.info(`Getting summary for project ${projectUUID}`);
    try {
      const service = await endorSVC.getProjectSummary(projectUUID, namespace);
      return res.send(service);
    } catch (error) {

      logger.error(`error getting Endor data for project ${projectUUID}: ${error}`);

      return res.status(500).send({
        status: 'failed',
        message: `error getting Endor data for project  ${projectUUID}`,
      });
    }
  });

  router.use(errorHandler());
  return router;
}
