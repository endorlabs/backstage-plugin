# Endor Labs Backstage Plugins

[![Current Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/endorlabs/backstage-plugin/releases)

## Table of Contents

- [Overview](#overview)
- [No Warranty](#no-warranty)
- [Features](#features)
- [Limitations](#limitations)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Entity Configuration](#entityconfiguration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Releases](#releases)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

## Overview

This README documentation is intended for the Endor Labs backend and frontend plugins for Backstage, which integrates vulnerability data from Endor Labs into the Backstage ecosystem. These plugins help development teams understand the high-level supply chain risks associated with their software components without having to leave the Backstage portal. The plugins make use of the Endor Labs APIs and so can be customised to meet your specific requirements. 

## No Warranty

Please be advised that this software is provided on an "as is" basis, without warranty of any kind, express or implied. The authors and contributors make no representations or warranties of any kind concerning the safety, suitability, lack of viruses, inaccuracies, typographical errors, or other harmful components of this software. There are inherent dangers in the use of any software, and you are solely responsible for determining whether this software is compatible with your equipment and other software installed on your equipment.

By using this software, you acknowledge that you have read this disclaimer, understand it, and agree to be bound by its terms and conditions. You also agree that the authors and contributors of this software are not liable for any damages you may suffer as a result of using, modifying, or distributing this software.

## Features

![](resources/preview.png)

- **Project Summary Integration**: Fetch and display a summary of vulnerability findings related to your project from Endor Labs.
- **Interactive Charts**: View vulnerability levels (Critical, High, Medium, Low) and interact with them to see detailed filtered results.
- **Status Accordions**: Detailed panels for various categories like SAST, CI/CD, Malware, License Risk, Operational Risk, Secrets, Containers, and RSPM (Repo Security Posture Management). The plugin summarises findings in term of categories (a finding can be in multiple categories).
- **Dynamic Link Generation**: Generate URLs dynamically to access detailed vulnerability reports based on the filters applied.

## Limitations

- The plugins are designed for use with the new [Backstage System Architecture](https://backstage.io/docs/backend-system/architecture/index)
- The plugins assume a 1:1 mapping between Backstage components and Endor Labs Projects (code respositories) and therefore may not be suitable for monorepos or specific packages
- The backend plugin only supports authentication via API keys (and therefore do not use the Backstage user's identity for authentication or authorization)

## Prerequisites

Before installing the plugin, ensure that you have:

- A running instance of Backstage using the [new backend system](https://backstage.io/docs/backend-system/building-backends/migrating). You can set up a new instance by following this [guide](https://backstage.io/docs/getting-started/).
- Access to the Endor Labs platform to create an API Key/Secret.

## Installation

1. Run this from the root of your Backstage installation:

   ```bash
   # For latest version from main branch
   curl -L https://github.com/endorlabs/backstage-plugin/archive/refs/heads/main.zip -o endor.zip

   # Extract the plugins from the ZIP archive to the backstage plugins folder
   unzip endor.zip "backstage-plugin-main/endor-backend/*" "backstage-plugin-main/endor-frontend/*" -d plugins && \
   mkdir -p plugins/endor-backend plugins/endor-frontend && \
   mv plugins/backstage-plugin-main/endor-backend/* plugins/endor-backend/ && \
   mv plugins/backstage-plugin-main/endor-frontend/* plugins/endor-frontend/ && \
   rm -rf plugins/backstage-plugin-main && \
   rm -rf endor.zip
   ```

   Or for a specific version:

   ```bash
   # Set the version you want to install
   VERSION=0.1.1

   # Download and extract the specific version
   curl -L https://github.com/endorlabs/backstage-plugin/archive/refs/tags/$VERSION.zip -o endor.zip

   # Extract the plugins from the ZIP archive to the backstage plugins folder
   # When downloading a tag, GitHub creates a folder named 'backstage-plugin-$VERSION'
   unzip endor.zip "backstage-plugin-$VERSION/endor-backend/*" "backstage-plugin-$VERSION/endor-frontend/*" -d plugins && \
   mkdir -p plugins/endor-backend plugins/endor-frontend && \
   mv plugins/backstage-plugin-$VERSION/endor-backend/* plugins/endor-backend/ && \
   mv plugins/backstage-plugin-$VERSION/endor-frontend/* plugins/endor-frontend/ && \
   rm -rf plugins/backstage-plugin-$VERSION && \
   rm -rf endor.zip
   ```

2. Install the necessary dependencies:

   ```bash
   yarn install
   ```

3. Add the backend plugin to the `packages/backend/src/index.ts` file like so:

   ```typescript
   import endorBackendPlugin from '@endorlabs/backend-plugin'; #Import Endor Labs backend plugin

   const backend = createBackend();

   ... #After existing plugins

   backend.add(endorBackendPlugin);
   ```

4. Create a set of API keys with the read-only permission to the root namespace within the Endor Labs platform [documentation](https://docs.endorlabs.com/administration/api-keys/)

5. Add the following to your relevant installation file (e.g. app-config.local.yaml):

   ```yaml
   endor:
     apiKey: <Your Endor Labs API Key>
     apiSecret: <Your Endor Labs API Secret>
     namespace: <Your root Endor Labs namespace>
     apiUrl: <Your Endor Labs API Url, e.g. https://api.endorlabs.com>
     appUrl: <Your Endor Labs Web Url; e.g. https://app.endorlabs.com> #Optional, defaults to https://app.endorlabs.com
   ```

6. Run `yarn dev` or `yarn start` from the root folder to start Backstage.

7. Navigate to [/endor-backend/health](http://localhost:7007/api/endor-backend/health) to verify you receive a HTTP 200/OK response. Test the backend plugin is working with a known project uuid:

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"projectUUID": "<your-valid-uuid>"}' http://localhost:7007/api/endor-backend/summary
   ```

8. Add the frontend plugin to your to your `/packages/app/src/App.tsx` file:

   ```typescript
   import { EndorFrontendPage } from "@endorlabs/frontend-plugin"; #Import Endor Labs frontend plugin
   const routes = (
     <FlatRoutes>
       ... #After existing routes
       <Route path="/endor" element={<EndorFrontendPage />} />
     </FlatRoutes>
   );
   ```

9. Add the frondend plugin page to your `/packages/app/src/components/catalog/EntityPage.tsx` file (or another component if preferred):

   ```typescript
   import { EndorFrontendPage } from "@endorlabs/frontend-plugin"; #Import Endor Labs frontend plugin
   const websiteEntityPage = (
     <EntityLayout>
       ... #After existing tabs
       <EntityLayout.Route path="/endor" title="Endor Labs">
         <EndorFrontendPage />
       </EntityLayout.Route>
     </EntityLayout>
   );
   ```

## Entity Configuration

Ensure your Backstage components include one of the following [annotations](https://backstage.io/docs/features/software-catalog/well-known-annotations/) (in order of precedence):

```yaml
metadata:
  annotations:
    endorlabs.com/project-uuid: <your project uuid>
    backstage.io/source-location: <your repository url>
    github.com/project-slug: <owner>/<repo>
```

## Usage

Once you have added the Endor annotations, navigate to the component page and select the Tab called "Endor Labs". You will see various information cards and charts that provide a comprehensive view of the vulnerabilities associated with your project. Interact with the charts and accordions to explore different findings and click-through to Endor Labs for detailed finding reports.

## Troubleshooting

Common issues and their solutions:

- **Backend health check fails**: Verify your API credentials and network connectivity to the Endor Labs API
- **No data appears in the frontend**: Check that your component has the correct annotations and that the project UUID exists in Endor Labs
- **Installation errors**: Make sure you're using a compatible version of Backstage with the new backend system

## Releases

Below is a list of available releases. You can also view all releases on the [GitHub Releases page](https://github.com/endorlabs/backstage-plugin/releases).

| Version | Backstage Version | Description |
|---------|--------------|-------------|
| [0.1.0](https://github.com/endorlabs/backstage-plugin/releases/tag/0.1.0) | 1.26.0| Initial experimental release with core functionality. |
| [0.1.1](https://github.com/endorlabs/backstage-plugin/releases/tag/0.1.1) | 1.40.0| Removed requirement for Endor Labs annotations. Implemented support for latest Endor Labs findings categories. |

Each release includes source code and installation instructions. You can download a specific version using the instructions in the [Installation](#installation) section.

## Future Enhancements

- Extend to provide support for a package annotation (to support monorepo configurations)
- Publish the plugins to NPM
- List plugin within the Backstage [plugin directory](https://backstage.io/docs/plugins/add-to-directory)

## Contributing

We welcome contributions to improve the Endor Labs Backstage Plugin! Here's how you can help:

1. **Fork the Repository**: Create your own fork of the repository
2. **Create a Branch**: Make your changes in a new branch
3. **Submit a Pull Request**: Once your changes are ready, submit a pull request
4. **Code Review**: Wait for a maintainer to review your changes
