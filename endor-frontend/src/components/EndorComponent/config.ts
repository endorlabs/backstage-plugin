import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';

export const ENDOR_NAMESPACE = 'endorlabs.com/namespace';
export const ENDOR_PROJECT_UUID = 'endorlabs.com/project-uuid';
export const SOURCE_LOCATION = 'backstage.io/source-location';
export const SOURCE_LOCATION_GITHUB = 'github.com/project-slug';


export const useEndorEntityData = ({ entity }: { entity: Entity }) => {
  const namespace = entity.metadata.annotations?.[ENDOR_NAMESPACE] ?? '';
  const projectUUID = entity.metadata.annotations?.[ENDOR_PROJECT_UUID] ?? '';
  let repoUrl = '';

  if (!projectUUID) {
    // Try source location first (most generic)
    if (entity.metadata.annotations?.[SOURCE_LOCATION]) {
      repoUrl = entity.metadata.annotations[SOURCE_LOCATION];
    }
    // Then try GitHub specific format
    else if (entity.metadata.annotations?.[SOURCE_LOCATION_GITHUB]) {
      const githubSlug = entity.metadata.annotations[SOURCE_LOCATION_GITHUB];
      // Fix the template literal syntax
      repoUrl = `https://github.com/${githubSlug}.git`;
    }
    // Could add more specific repository types here if needed
  }

  return {
    namespace,
    projectUUID,
    repoUrl,
  };
};

export const useEndorConfigData = ({ config }: { config: Config }) => {
  const baseUrl = config.getOptionalString('endor.appUrl') ?? 'https://app.endorlabs.com';
  return {
    baseUrl,
  }
};
