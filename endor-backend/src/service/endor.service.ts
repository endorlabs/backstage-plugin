import { EndorAPI, Project, ProjectSummary, KeyValueArray } from "./types/project";
import { AuthenticationService } from "./auth.service";
import { EndorConfig } from "./types/config";

export class EndorService implements EndorAPI {
  private endorConfig: EndorConfig;
  private authService: AuthenticationService;

  constructor(EndorConfig: EndorConfig) {
    this.endorConfig = EndorConfig;
    this.authService = new AuthenticationService(EndorConfig);
  }

  async getProjectByRepoUrl(repoUrl: string): Promise<Project> {
    try {
      const token = await this.authService.auth();

      // Use the correct API endpoint with query parameters
      const url = `${this.endorConfig.apiUrl}/v1/namespaces/${this.endorConfig.namespace}/projects?list_parameters.filter=meta.name==${encodeURIComponent(repoUrl)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Encoding': 'gzip, deflate, br, zstd',
        },
      });
    
      if (!response.ok) {
        throw new Error(`Error fetching project by repo: ${response.statusText}`);
      }

      const data = await response.json();
      
      // The API returns a list of objects, we need to get the first one
      if (!data.list?.objects?.length) {
        throw new Error(`No project found for repository: ${repoUrl}`);
      }

      // Return the first matching project
      return data.list.objects[0];
    } catch (error) {
      console.error('Failed to fetch project by repo:', error);
      throw error;
    }
  }

  async getProjectSummary(projectUUID: string): Promise<ProjectSummary> {
    try {
      const token = await this.authService.auth();

      const projectData = await this.getProject(projectUUID, token);
      const totalVulns = await this.getTotalVulnerabilities(projectUUID, token);
      const reachableVulns = await this.getReachableVulnerabilities(projectUUID, token);
      const findingsCountByCategory = await this.getFindingsCountByCategory(projectUUID, token);

      const projectSummary: ProjectSummary = {
        name: projectData.meta.name,
        namespace: projectData.tenant_meta.namespace,
        projectUUID: projectUUID,
        total: totalVulns,
        reachable: reachableVulns,
        categories: findingsCountByCategory
      }

      return projectSummary
    } catch (error) {
      console.error('Failed to fetch vulnerability summary:', error);
      throw error;
    }
  }

  private async getTotalVulnerabilities(projectUUID: string, token: string) {
    // Properly encode URL parameters
    const queryParams = new URLSearchParams({
      'list_parameters.filter': `spec.project_uuid==${projectUUID} and context.type==CONTEXT_TYPE_MAIN and spec.finding_categories contains [FINDING_CATEGORY_VULNERABILITY]`,
      'list_parameters.count': 'false',
      'list_parameters.group.aggregation_paths': 'spec.level'
    });

    const url = `${this.endorConfig.apiUrl}/v1/namespaces/${this.endorConfig.namespace}/findings?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching total findings: ${response.statusText}`);
    }

    const data = await response.json();
    return this.getTotalCountsByFindingLevel(data);
  }

  private async getReachableVulnerabilities(projectUUID: string, token: string) {
    // Properly encode URL parameters
    const queryParams = new URLSearchParams({
      'list_parameters.filter': `spec.project_uuid==${projectUUID} and context.type==CONTEXT_TYPE_MAIN and spec.finding_tags CONTAINS [\"FINDING_TAGS_REACHABLE_FUNCTION\"]`,
      'list_parameters.count': 'false',
      'list_parameters.group.aggregation_paths': 'spec.level'
    });

    const url = `${this.endorConfig.apiUrl}/v1/namespaces/${this.endorConfig.namespace}/findings?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching total findings: ${response.statusText}`);
    }

    const data = await response.json();
    return this.getTotalCountsByFindingLevel(data);
  }

  private async getProject(projectUUID: string, token: string): Promise<Project> {
    const url = `${this.endorConfig.apiUrl}/v1/namespaces/${this.endorConfig.namespace}/projects/${projectUUID}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching project: ${response.statusText}`);
    }

    return response.json() as Promise<Project>
  }

  private async getFindingsCountByCategory(projectUUID: string, token: string) {
    // Properly encode URL parameters
    const queryParams = new URLSearchParams({
      'list_parameters.filter': `spec.project_uuid==${projectUUID} and context.type==CONTEXT_TYPE_MAIN`,
      'list_parameters.group.aggregation_paths': 'spec.finding_categories'
    });

    const url = `${this.endorConfig.apiUrl}/v1/namespaces/${this.endorConfig.namespace}/findings?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching findings by Category: ${response.statusText}`);
    }

    const data = await response.json();
    return this.getTotalCountsByCategory(data);
  }

  private getTotalCountsByCategory(data: any): KeyValueArray {
    const groups = data.group_response.groups;
    const result: KeyValueArray = {};

    Object.keys(groups).forEach(key => {
      const group = JSON.parse(key);
      const count = groups[key].aggregation_count.count;
      group.forEach((item: { key: string; value: string[] }) => {
        item.value.forEach(category => {
          if (!result[category]) {
            result[category] = { count: 0 };
          }
          result[category].count += count;
        });
      });
    });

    return result;
  }

  private getTotalCountsByFindingLevel(data: any): KeyValueArray {
    const groups = data.group_response.groups;
    const result: KeyValueArray = {};

    Object.keys(groups).forEach(key => {
        const parsedKey = JSON.parse(key);
        const level = parsedKey[0].value; // Correctly accessing the first element of the array
        const count = groups[key].aggregation_count.count;

        if (!result[level]) {
            result[level] = { count: 0 };
        }
        result[level].count += count;
    });

    return result;
  }
}
