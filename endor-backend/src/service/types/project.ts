interface Count {
    count: number;
}

export type KeyValueArray = {
    [key: string]: Count;
}

export type ProjectSummary = {
    name: string;
    namespace: string;
    projectUUID: string;
    total: KeyValueArray;
    reachable: KeyValueArray;
    categories: KeyValueArray
};

// Endor service interface
export interface EndorAPI {
    getProjectSummary(projectUUID: string, repoUrl?: string): Promise<ProjectSummary>;
}

export type Project = {
    uuid: string;
    tenant_meta: TenantMeta;
    meta: Meta;
    spec: Spec;
    processing_status: ProcessingStatus;
}

interface TenantMeta {
    namespace: string;
}

interface Meta {
    create_time: string;
    update_time: string;
    upsert_time: string | null;
    name: string;
    kind: string;
    version: string;
    description: string | null;
    parent_uuid: string | null;
    parent_kind: string | null;
    tags: string[];
    annotations: { [key: string]: any };
    created_by: string | null;
    updated_by: string;
    references: { [key: string]: any };
}

interface Spec {
    platform_source: string;
    internal_reference_key: string;
    git: Git;
    ingestion_token: string | null;
}

interface Git {
    http_clone_url: string;
    git_clone_url: string;
    organization: string;
    path: string;
    full_name: string;
    web_url: string;
    external_installation_id: string;
    invalid_installation: boolean;
}

interface ProcessingStatus {
    scan_state: string;
    scan_time: string;
    analytic_time: string | null;
    disable_automated_scan: boolean;
    metadata: Metadata;
}

interface Metadata {
    full_history_scan_time: string;
}
