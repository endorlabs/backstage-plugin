import React from 'react';
import { useState, useEffect } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Header,
  Page,
  Content,
  HeaderLabel,
  WarningPanel,
  InfoCard,
  CodeSnippet,
} from '@backstage/core-components';
import { useEndorConfigData, useEndorEntityData } from './config';
import { ProjectSummary, endorApiRef } from '../../types';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { BarChart, BarItemIdentifier } from '@mui/x-charts';
import { Grid } from '@material-ui/core';
import StatusAccordion from './StatusAccordian';
import { buildEndorFindingsUrl } from '../../helper/endor';

export const EndorPage = () => {
  const { entity } = useEntity();
  const { namespace, projectUUID: projectUUID } = useEndorEntityData({
    entity,
  });

  const [projectSummary, setProjectSummary] = useState({} as any);
  const [error, setError] = useState({} as any);

  // Config Endor data
  const config = useApi(configApiRef);
  const endorApi = useApi(endorApiRef);
  const { baseUrl } = useEndorConfigData({ config });

  const getEndorData = async () => {
    try {
      const projectSummary: ProjectSummary = await endorApi.getProjectSummary(
        projectUUID,
        namespace,
      );
      setProjectSummary(projectSummary);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error);
    }
  };

  useEffect(() => {
    getEndorData();
  }, []);

  const chartClickHandler = (
    _event: React.MouseEvent<SVGElement>,
    barItemIdentifier: BarItemIdentifier
  ) => {
    const { seriesId, dataIndex } = barItemIdentifier;
    //dataIndex: 0 (total), 1 (reachable)
    //seriesId: FINDING_LEVEL_CRITICAL etc
    let filter = `${baseFilters.dependency} and spec.level in [${seriesId}] and spec.finding_categories contains [FINDING_CATEGORY_VULNERABILITY]`;
    if (dataIndex == 1) {
      filter += ` and spec.finding_tags contains [FINDING_TAGS_REACHABLE_FUNCTION]`;
    }

    const url = buildEndorFindingsUrl(namespace, 'dependency', filter, baseUrl);

    window.open(url, '_blank');
  };

  const baseFilters = {
    dependency: `meta.parent_kind==PackageVersion and spec.ecosystem!=ECOSYSTEM_GITHUB_ACTION and spec.finding_tags not contains [FINDING_TAGS_SELF] and spec.project_uuid==${projectUUID}`,
    package: `meta.parent_kind==PackageVersion and spec.ecosystem!=ECOSYSTEM_GITHUB_ACTION and spec.finding_tags contains [FINDING_TAGS_SELF] and spec.project_uuid==${projectUUID}`,
    repository: `meta.parent_kind in [Repository,RepositoryVersion] and spec.finding_categories not contains [FINDING_CATEGORY_SECRETS] and spec.project_uuid==${projectUUID}`,
    secrets: `spec.finding_categories contains [FINDING_CATEGORY_SECRETS] and spec.project_uuid==${projectUUID}`,
  };

  const metrics = {
    cicd: projectSummary?.categories?.FINDING_CATEGORY_CICD?.count ?? 0,
    malware: projectSummary?.categories?.FINDING_CATEGORY_MALWARE?.count ?? 0,
    license:
      projectSummary?.categories?.FINDING_CATEGORY_LICENSE_RISK?.count ?? 0,
    operational:
      projectSummary?.categories?.FINDING_CATEGORY_OPERATIONAL?.count ?? 0,
    scpm: projectSummary?.categories?.FINDING_CATEGORY_SCPM?.count ?? 0,
    secrets: projectSummary?.categories?.FINDING_CATEGORY_SECRETS?.count ?? 0,
    security: projectSummary?.categories?.FINDING_CATEGORY_SECURITY?.count ?? 0,
    supply:
      projectSummary?.categories?.FINDING_CATEGORY_SUPPLY_CHAIN?.count ?? 0,
  };

  const links = {
    cicd: buildEndorFindingsUrl(
      namespace,
      'repository',
      `${baseFilters.repository} and spec.finding_categories contains [FINDING_CATEGORY_CICD]`,
      baseUrl,
    ),
    malware: buildEndorFindingsUrl(
      namespace,
      'dependency',
      `${baseFilters.dependency} and spec.finding_categories contains [FINDING_CATEGORY_MALWARE]`,
      baseUrl,
    ),
    license: buildEndorFindingsUrl(
      namespace,
      'dependency',
      `${baseFilters.dependency} and spec.finding_categories contains [FINDING_CATEGORY_LICENSE_RISK]`,
      baseUrl,
    ),
    operational: buildEndorFindingsUrl(
      namespace,
      'dependency',
      `${baseFilters.dependency} and spec.finding_categories contains [FINDING_CATEGORY_OPERATIONAL]`,
      baseUrl,
    ),
    scpm: buildEndorFindingsUrl(
      namespace,
      'repository',
      `${baseFilters.repository} and spec.finding_categories contains [FINDING_CATEGORY_SCPM]`,
      baseUrl,
    ),
    secrets: buildEndorFindingsUrl(
      namespace,
      'secrets',
      baseFilters.secrets,
      baseUrl,
    ),
    security: buildEndorFindingsUrl(
      namespace,
      'dependency',
      `${baseFilters.dependency} and spec.finding_categories contains [FINDING_CATEGORY_SECURITY]`,
      baseUrl,
    ),
    supply: buildEndorFindingsUrl(
      namespace,
      'dependency',
      `${baseFilters.dependency} and spec.finding_categories contains [FINDING_CATEGORY_SUPPLY_CHAIN]`,
      baseUrl,
    ),
  };

  return (
    <Page themeId="tool">
      {error ? (
        <WarningPanel
          title="Entity missing annotation"
          message={
            <>
              Please add the following annotations into your catalog yaml file
              to include data from Endor Labs:
            </>
          }
        >
          <CodeSnippet
            text={
              'endorlabs.com/namespace: <your namespace>\nendorlabs.com/project-uuid: <your project uuid>'
            }
            language={'YAML'}
          />
        </WarningPanel>
      ) : (
        <>
          <Header
            title="Endor Labs"
            subtitle="Software Supply Chain Security Without the Productivity Tax"
          >
            <HeaderLabel label="Endor Namespace" value={namespace} />
            <HeaderLabel label="Project Name" value={projectSummary.name} />
          </Header>
          <Content>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InfoCard
                  title="Vulnerabilities"
                  subheader="Endor Labs has performed function-level reachability analysis of your project to help you prioritise your remediation"
                >
                  <BarChart
                    layout="horizontal"
                    margin={{ left: 75 }}
                    yAxis={[
                      { scaleType: 'band', data: ['Total', 'Reachable'] },
                    ]}
                    series={[
                      {
                        id: 'FINDING_LEVEL_CRITICAL',
                        data: [
                          projectSummary?.total?.FINDING_LEVEL_CRITICAL?.count,
                          projectSummary?.reachable?.FINDING_LEVEL_CRITICAL
                            ?.count,
                        ],
                        stack: 'A',
                        label: 'Critical',
                        color: 'rgb(143, 36, 61)',
                      },
                      {
                        id: 'FINDING_LEVEL_HIGH',
                        data: [
                          projectSummary?.total?.FINDING_LEVEL_HIGH?.count,
                          projectSummary?.reachable?.FINDING_LEVEL_HIGH?.count,
                        ],
                        stack: 'A',
                        label: 'High',
                        color: 'rgb(220, 30, 39)',
                      },
                      {
                        id: 'FINDING_LEVEL_MEDIUM',
                        data: [
                          projectSummary?.total?.FINDING_LEVEL_MEDIUM?.count,
                          projectSummary?.reachable?.FINDING_LEVEL_MEDIUM
                            ?.count,
                        ],
                        stack: 'A',
                        label: 'Medium',
                        color: 'rgb(255, 142, 61)',
                      },
                      {
                        id: 'FINDING_LEVEL_LOW',
                        data: [
                          projectSummary?.total?.FINDING_LEVEL_LOW?.count,
                          projectSummary?.reachable?.FINDING_LEVEL_LOW?.count,
                        ],
                        stack: 'A',
                        label: 'Low',
                        color: 'rgb(255, 200, 0)',
                      },
                    ]}
                    height={150}
                    onItemClick={chartClickHandler}
                  />
                </InfoCard>
              </Grid>
              <Grid item xs={6}>
                <InfoCard title="Secure Repositories and Pipelines">
                    <StatusAccordion
                      title="Source Code Posture Management"
                      count={metrics.scpm}
                      explanation="You have {count} findings for Source Code Posture Management. Strong information security practices are necessary to secure your open source code used in your development and delivery infrastructure."
                      warningThreshold={1}
                      errorThreshold={2}
                      link={links.scpm}
                    />
                    <StatusAccordion
                      title="Leaked Secrets"
                      count={metrics.secrets}
                      explanation="You have {count} potential secrets stored within your project's source code. Secrets are access credentials that provide access to key resources and services, such as passwords, API keys, and personal access tokens."
                      warningThreshold={1}
                      errorThreshold={1}
                      link={links.secrets}
                    />
                    <StatusAccordion
                      title="CI/CD Tooling"
                      count={metrics.cicd}
                      explanation="You have {count} findings for CI/CD policies which include unauthorized use of tools or you are missing a required tool (e.g., no SAST in place)."
                      warningThreshold={1}
                      errorThreshold={1}
                      link={links.cicd}
                    />
                </InfoCard>
              </Grid>
              <Grid item xs={6}>
                <InfoCard title="Secure Open Source Code">
                  <StatusAccordion
                    title="Malware"
                    count={metrics.malware}
                    explanation="You have {count} findings for malicious dependencies."
                    warningThreshold={0}
                    errorThreshold={1}
                    link={links.malware}
                  />
                  <StatusAccordion
                    title="License Risk"
                    count={metrics.license}
                    explanation="You have {count} dependencies which may introduce license risk such as missing licenses, conflicting licenses, or licenses which violate your policies."
                    warningThreshold={1}
                    errorThreshold={3}
                    link={links.license}
                  />
                  <StatusAccordion
                    title="Operational Risk"
                    count={metrics.operational}
                    explanation="You have {count} findings for operational risk including Outdated Dependencies, Unmaintained Dependencies, Unpinned Direct Dependencies, Unused Direct Dependencies, License Risks and more."
                    warningThreshold={1}
                    errorThreshold={5}
                    link={links.operational}
                  />
                  <StatusAccordion
                    title="Security Risk"
                    count={metrics.security}
                    explanation="You have {count} findings for security risk including Vulnerabilities, Missing Source Code, Leaked Secrets and more."
                    warningThreshold={1}
                    errorThreshold={5}
                    link={links.security}
                  />
                  <StatusAccordion
                    title="Supply Chain Risk"
                    count={metrics.supply}
                    explanation="You have {count} findings for supply chain risk including Typosquatting, Maliocious Packages and more."
                    warningThreshold={1}
                    errorThreshold={5}
                    link={links.supply}
                  />
                </InfoCard>
              </Grid>
            </Grid>
          </Content>
        </>
      )}
    </Page>
  );
};
