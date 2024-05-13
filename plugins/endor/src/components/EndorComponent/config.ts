import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';

export const ENDOR_NAMESPACE = 'endorlabs.com/namespace';
export const ENDOR_PROJECT_UUID = 'endorlabs.com/project-uuid';

export const useEndorEntityData = ({ entity }: { entity: Entity }) => {
  const namespace = entity.metadata.annotations?.[ENDOR_NAMESPACE] ?? '';
  const projectUUID = entity.metadata.annotations?.[ENDOR_PROJECT_UUID] ?? '';

  return {
    namespace,
    projectUUID: projectUUID,
  };
};

export const useEndorConfigData = ({ config }: { config: Config }) => {
  const baseUrl = config.getOptionalString('endor.appUrl') ?? 'https://app.endorlabs.com';
  return {
    baseUrl,
  }
};
