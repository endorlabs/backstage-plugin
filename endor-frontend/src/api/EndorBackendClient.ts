import { DiscoveryApi } from "@backstage/core-plugin-api";
import { EndorApi, ProjectSummary } from "../types";

export class EndorBackendClient implements EndorApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error("Endor API call failed: " + response.statusText);
    }
    return await response.json();
  }

  async getProjectSummary(projectUUID: string, namespace: string): Promise<ProjectSummary> {
    if (!projectUUID || !namespace) {
      throw new Error("projectUUID and namespace must be defined");
    }
    const url = `${await this.discoveryApi.getBaseUrl('endor-backend')}/namespaces/${namespace}/summary/${projectUUID}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }

}