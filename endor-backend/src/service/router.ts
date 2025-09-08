import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { EndorService } from './endor.service';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface RouterOptions {
  logger: LoggerService;
  config: Config; // app-config
}

// Error types for better frontend handling
export enum EndorErrorType {
  MISSING_ANNOTATION = 'MISSING_ANNOTATION',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  REPO_NOT_FOUND = 'REPO_NOT_FOUND',
  API_ERROR = 'API_ERROR',
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
  const namespace = config.getString('endor.namespace');

  const endorSVC = new EndorService({ apiUrl: apiUrl, apiKey, apiSecret, namespace });

  router.get('/health', (_req, res) => {
    res.status(200).send({ status: 'ok', apiURL: apiUrl });
  });

  router.post('/summary', async (req, res) => {
    let { projectUUID, repoUrl } = req.body;
    logger.info(`Getting summary for ${projectUUID ? `project ${projectUUID}` : `repo ${repoUrl}`}`);

    // Case 1: Missing annotations
    if (!projectUUID && !repoUrl) {
      return res.status(400).send({
        status: 'failed',
        errorType: EndorErrorType.MISSING_ANNOTATION,
        message: 'Missing required annotations',
      });
    }

    try {
      // If we have repoUrl but no projectUUID, try to get the project by repo URL
      if (!projectUUID && repoUrl) {
        try {
          const project = await endorSVC.getProjectByRepoUrl(repoUrl);
          projectUUID = project.uuid;
        } catch (error) {
          return res.status(404).send({
            status: 'failed',
            errorType: EndorErrorType.REPO_NOT_FOUND,
            message: 'Repository not scanned',
          });
        }
      }

      // Now get the project summary with the UUID
      const service = await endorSVC.getProjectSummary(projectUUID);
      return res.send(service);
    } catch (error) {
      // Handle 404 errors as PROJECT_NOT_FOUND
      if (error instanceof Error && 
          (error.message.includes('not found') || 
           error.message.includes('404') || 
           error.message.includes('Not Found'))) {
        return res.status(404).send({
          status: 'failed',
          errorType: EndorErrorType.PROJECT_NOT_FOUND,
          message: 'Project not found',
        });
      }
      
      // All other errors are API_ERROR
      logger.error(`API error: ${error}`);
      return res.status(500).send({
        status: 'failed',
        errorType: EndorErrorType.API_ERROR,
        message: `API error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });

  return router;
}
