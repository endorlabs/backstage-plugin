import { createApiRef } from "@backstage/core-plugin-api";

export const endorApiRef = createApiRef<EndorApi>({
    id: 'plugin.endor.service',
  });

export interface EndorApi {
    getProjectSummary(projectUUID: string, namespace: string): Promise<ProjectSummary>;
}

interface SeverityCounts {
    total: number;
    reachable: number;
}

export type ProjectSummary = {
    name: string;
    vulnerabilities: {
        [level: string]: SeverityCounts;
    };
};