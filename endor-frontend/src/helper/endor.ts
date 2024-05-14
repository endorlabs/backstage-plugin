export function buildEndorFindingsUrl(namespace: string, category: string, filter: string, baseUrl: string) {
    return new URL(
      `/t/${encodeURIComponent(
        namespace
      )}/findings/${category}/?filter=${encodeURIComponent(filter)}`,
      baseUrl
    );
  }