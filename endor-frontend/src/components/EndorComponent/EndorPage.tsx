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
    let filter = `${baseFilter} and spec.level in [${seriesId}] and spec.finding_categories contains [FINDING_CATEGORY_VULNERABILITY]`;
    if (dataIndex == 1) {
      filter += ` and spec.finding_tags contains [FINDING_TAGS_REACHABLE_FUNCTION]`;
    }

    const url = buildEndorFindingsUrl(namespace, projectUUID, filter, baseUrl);

    window.open(url, '_blank');
  };

  const baseFilter = `spec.finding_tags not contains ["FINDING_TAGS_EXCEPTION"]`

  // Define category information type
  type CategoryInfo = {
    key: string;
    count: number;
    link: URL;
    explanation: string;
    warningThreshold: number;
    errorThreshold: number;
    title: string;
  };

  // Define a single consolidated object with all category information
  const categories: Record<string, CategoryInfo> = {
    operational: {
      key: 'FINDING_CATEGORY_OPERATIONAL',
      count: projectSummary?.categories?.FINDING_CATEGORY_OPERATIONAL?.count ?? 0,
      title: 'Operational Risk',
      explanation: "You have {count} findings for operational risk including Outdated Dependencies, Unmaintained Dependencies, Unpinned Direct Dependencies, Unused Direct Dependencies, License Risks and more.",
      warningThreshold: 0,
      errorThreshold: 5,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_OPERATIONAL"])`, baseUrl),
    },
    license: {
      key: 'FINDING_CATEGORY_LICENSE_RISK',
      count: projectSummary?.categories?.FINDING_CATEGORY_LICENSE_RISK?.count ?? 0,
      title: 'License Risk',
      explanation: "You have {count} dependencies which may introduce license risk such as missing licenses, conflicting licenses, or licenses which violate your policies.",
      warningThreshold: 0,
      errorThreshold: 3,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_LICENSE_RISK"])`, baseUrl),
    },
    malware: {
      key: 'FINDING_CATEGORY_MALWARE',
      count: projectSummary?.categories?.FINDING_CATEGORY_MALWARE?.count ?? 0,
      title: 'Malware',
      explanation: "You have {count} findings for malicious dependencies.",
      warningThreshold: 0,
      errorThreshold: 1,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_MALWARE"])`, baseUrl),
    },
    aiModels: {
      key: 'FINDING_CATEGORY_AI_MODELS',
      count: projectSummary?.categories?.FINDING_CATEGORY_AI_MODELS?.count ?? 0,
      title: 'AI Models',
      explanation: "You have {count} findings for risks associated with AI models.",
      warningThreshold: 0,
      errorThreshold: 5,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_AI_MODELS"])`, baseUrl),
    },
    sast: {
      key: 'FINDING_CATEGORY_SAST',
      count: projectSummary?.categories?.FINDING_CATEGORY_SAST?.count ?? 0,
      title: 'SAST',
      explanation: "You have {count} findings for Static Application Security Testing (SAST).",
      warningThreshold: 0,
      errorThreshold: 2,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_SAST"])`, baseUrl),
    },
    secrets: {
      key: 'FINDING_CATEGORY_SECRETS',
      count: projectSummary?.categories?.FINDING_CATEGORY_SECRETS?.count ?? 0,
      title: 'Secrets',
      explanation: "You have {count} potential secrets stored within your project's source code. Secrets are access credentials that provide access to key resources and services, such as passwords, API keys, and personal access tokens.",
      warningThreshold: 0,
      errorThreshold: 1,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_SECRETS"])`, baseUrl),
    },
    cicd: {
      key: 'FINDING_CATEGORY_CICD',
      count: projectSummary?.categories?.FINDING_CATEGORY_CICD?.count ?? 0,
      title: 'CI/CD',
      explanation: "You have {count} findings for CI/CD which include vulnerabilities in your GitHub Actions, GitHub workflows or other CI/CD tools.",
      warningThreshold: 0,
      errorThreshold: 1,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_CICD"])`, baseUrl),
    },
    scpm: {
      key: 'FINDING_CATEGORY_SCPM',
      count: projectSummary?.categories?.FINDING_CATEGORY_SCPM?.count ?? 0,
      title: 'Repo Security Posture Management',
      explanation: "You have {count} findings for Repo Security Posture Management. Strong information security practices are necessary to secure your open source code used in your development and delivery infrastructure.",
      warningThreshold: 0,
      errorThreshold: 2,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_SCPM"])`, baseUrl),
    },
    containers: {
      key: 'FINDING_CATEGORY_CONTAINERS',
      count: projectSummary?.categories?.FINDING_CATEGORY_CONTAINERS?.count ?? 0,
      title: 'Containers',
      explanation: "You have {count} findings for Container scans. These are vulnerabilities in OS packages, language-specific packages, and application dependencies.",
      warningThreshold: 0,
      errorThreshold: 2,
      link: buildEndorFindingsUrl(namespace, projectUUID, `(${baseFilter} and spec.finding_categories contains ["FINDING_CATEGORY_CONTAINERS"])`, baseUrl),
    },
  };

  return (
    <Page themeId="tool">
      {error ? (
        <WarningPanel
          title="Entity missing annotation"
          message={
            <>
              Please verify your credentials and add the following annotations into your catalog yaml file:
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
            subtitle="AppSec for the Software Development Revolution"
          >
            <HeaderLabel label="Endor Namespace" value={namespace} />
            <HeaderLabel label="Project Name" value={projectSummary.name} />
          </Header>
          <Content>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InfoCard
                  title="Vulnerabilities"
                  subheader="To help developers and security teams make informed decisions for SCA results, Endor Labs leverages a static analysis technique called program analysis to perform function-level reachability analysis on direct and transitive dependencies. This is the most accurate way to determine exploitability in the context of your application, which is critical for determining which risks should be remediated."
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
              <Grid item xs={12} md={6}>
                <InfoCard title="Code Dependencies">
                  <StatusAccordion
                    title={categories.malware.title}
                    count={categories.malware.count}
                    explanation={categories.malware.explanation}
                    warningThreshold={categories.malware.warningThreshold}
                    errorThreshold={categories.malware.errorThreshold}
                    link={categories.malware.link}
                  />
                  <StatusAccordion
                    title={categories.license.title}
                    count={categories.license.count}
                    explanation={categories.license.explanation}
                    warningThreshold={categories.license.warningThreshold}
                    errorThreshold={categories.license.errorThreshold}
                    link={categories.license.link}
                  />
                  <StatusAccordion
                    title={categories.operational.title}
                    count={categories.operational.count}
                    explanation={categories.operational.explanation}
                    warningThreshold={categories.operational.warningThreshold}
                    errorThreshold={categories.operational.errorThreshold}
                    link={categories.operational.link}
                  />
                  <StatusAccordion
                    title={categories.aiModels.title}
                    count={categories.aiModels.count}
                    explanation={categories.aiModels.explanation}
                    warningThreshold={categories.aiModels.warningThreshold}
                    errorThreshold={categories.aiModels.errorThreshold}
                    link={categories.aiModels.link}
                  />
                </InfoCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoCard title="CI/CD Security">
                    <StatusAccordion
                      title={categories.scpm.title}
                      count={categories.scpm.count}
                      explanation={categories.scpm.explanation}
                      warningThreshold={categories.scpm.warningThreshold}
                      errorThreshold={categories.scpm.errorThreshold}
                      link={categories.scpm.link}
                    />
                    <StatusAccordion
                      title={categories.cicd.title}
                      count={categories.cicd.count}
                      explanation={categories.cicd.explanation}
                      warningThreshold={categories.cicd.warningThreshold}
                      errorThreshold={categories.cicd.errorThreshold}
                      link={categories.cicd.link}
                    />
                </InfoCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoCard title="First Party Code">
                    <StatusAccordion
                      title={categories.sast.title}
                      count={categories.sast.count}
                      explanation={categories.sast.explanation}
                      warningThreshold={categories.sast.warningThreshold}
                      errorThreshold={categories.sast.errorThreshold}
                      link={categories.sast.link}
                    />
                    <StatusAccordion
                      title={categories.secrets.title}
                      count={categories.secrets.count}
                      explanation={categories.secrets.explanation}
                      warningThreshold={categories.secrets.warningThreshold}
                      errorThreshold={categories.secrets.errorThreshold}
                      link={categories.secrets.link}
                    />
                </InfoCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoCard title="Container Security">
                    <StatusAccordion
                      title={categories.containers.title}
                      count={categories.containers.count}
                      explanation={categories.containers.explanation}
                      warningThreshold={categories.containers.warningThreshold}
                      errorThreshold={categories.containers.errorThreshold}
                      link={categories.containers.link}
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
