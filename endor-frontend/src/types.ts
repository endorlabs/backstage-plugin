import { createApiRef } from "@backstage/core-plugin-api";

export const endorApiRef = createApiRef<EndorApi>({
    id: 'plugin.endor.service',
  });

// Error types matching backend
export enum EndorErrorType {
  MISSING_ANNOTATION = 'MISSING_ANNOTATION',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  REPO_NOT_FOUND = 'REPO_NOT_FOUND',
  API_ERROR = 'API_ERROR',
}

export interface EndorError {
  status: string;
  errorType: EndorErrorType;
  message: string;
}

export interface EndorApi {
    getProjectSummary(projectUUID: string, repoUrl?: string): Promise<ProjectSummary>;
}

interface SeverityCounts {
    total: number;
    reachable: number;
}

export type ProjectSummary = {
    name: string;
    namespace: string;
    projectUUID: string;
    vulnerabilities: {
        [level: string]: SeverityCounts;
    };
};