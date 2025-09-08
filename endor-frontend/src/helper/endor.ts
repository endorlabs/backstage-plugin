export function buildEndorFindingsUrl(namespace: string, projectUUID: string, filter: string, baseUrl: string) {
    return new URL(
      `/t/${encodeURIComponent(
        namespace
      )}/projects/${projectUUID}/versions/default/findings/?filter=${encodeURIComponent(filter)}`,
      baseUrl
    );
  }