import { DiscoveryApi } from "@backstage/core-plugin-api";
import { EndorApi, EndorError, EndorErrorType, ProjectSummary } from "../types";

export class EndorBackendClient implements EndorApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  private async handleResponse(response: Response): Promise<any> {
    const data = await response.json();
    
    if (!response.ok) {
      const errorData = data as EndorError;
      const errorMessage = errorData.message || response.statusText || "Unknown error";
      const error = new Error(errorMessage);
      (error as any).errorType = errorData.errorType || EndorErrorType.API_ERROR;
      throw error;
    }
    
    return data;
  }

  async getProjectSummary(projectUUID: string, repoUrl?: string): Promise<ProjectSummary> {
    if (!projectUUID && !repoUrl) {
      const error = new Error("Missing required annotations");
      (error as any).errorType = EndorErrorType.MISSING_ANNOTATION;
      throw error;
    }

    const url = `${await this.discoveryApi.getBaseUrl('endor-backend')}/summary`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectUUID,
        repoUrl,
      }),
    });
    return await this.handleResponse(response);
  }

}