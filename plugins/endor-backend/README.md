# Endor Labs Backend Plugin for Backstage

## Overview

This README documentation is intended for the Endor Labs Backend Plugin for Backstage, which integrates vulnerability data from Endor Labs into the Backstage ecosystem. This plugin is intended to be used within the frontend plugin and provides authen

## Limitations

* The plugin has only been tested with the new Backstage backend architecture
* The plugin only supports authentication via API keys

## Core Functionality

The service is designed to handle several key operations:

* **Authentication**: Leverages the AuthenticationService to manage API access.
* **Data Retrieval**: Connects to the Endor API to fetch project-specific findings data.
* **Data Processing**: Processes the data to summarize and categorize findings effectively, reducing frontend API calls.

## Prerequisites

Before installing the plugin, ensure that you have:

- A running instance of Backstage using the [new backend system](https://backstage.io/docs/backend-system/building-backends/migrating). You can set up a new instance by following this [guide](https://backstage.io/docs/getting-started/).
- Access to the Endor Labs platform with a valid API key/secret for read-only access.
- The necessary permissions to add plugins to your Backstage instance

# Installation

1. If you don't have a backstage instance then create a new one using `npx @backstage/create-app@latest` then cd into your new backstage folder and run `yaml install` followed by `yarn dev` and check you can access the UI at [http://localhost/3000]](http://localhost:3000).

2. Clone the plugin repository into your Backstage plugins directory:

```bash {"id":"01HXS36AQM476VJ90SRGNRP9FM"}
cd plugins && git clone https://github.com/endorlabs/backstage-plugin
```

3. Install the necessary dependencies:

```bash {"id":"01HXS36AQM476VJ90SRM1CE195"}
cd endor-backend && yarn install
```

4. Add the plugin to the (packages/backend/src/index.ts)[index.ts] file like so:

```typescript {"id":"01HXS36AQM476VJ90SRMVE212A"}
  import endorBackendPlugin from '@internal/plugin-endor-backend';

  const backend = createBackend();

  ...

  backend.add(endorBackendPlugin);
```

1. Create a set of API keys with the read-only permission within the Endor Labs platform (docs)[https://docs.endorlabs.com/administration/api-keys/]
2. Add the following to your file:

```yaml {"id":"01HXS36AQM476VJ90SRPB64A7D"}
  # Backstage override configuration for your local development environment
  endor:
    apiKey: <Your Endor API Key>
    apiSecret: <Your Endor API Secret>
    apiUrl: <Your API Url, e.g. https://api.endorlabs.com>
    appUrl: <Your App Url; e.g. https://app.endorlabs.com> #Optional, defaults to https://app.endorlabs.com
```

## Configuration

Ensure your Backstage catalog includes the Endor Labs annotations for each entity:

```yaml {"id":"01HXS36AQM476VJ90SRRFHA594"}
metadata:
  annotations:
    endorlabs.com/namespace: <your namespace>
    endorlabs.com/project-uuid: <your project uuid>
```

## Getting started

Test your plugin run `yarn start-backend` in the root directory, then:

1. Navigate to [/endor-backend/health](http://localhost:7007/api/endor-backend/health) to verify you receive a HTTP 200/OK response.
2. Navigate to [/endor-backend/namespaces/:namespace/summary/:projectUUID](http://localhost:7007/api/endor-backend/namespaces/:namespace/summary/:projectUUID) with a valid namespace/projectUUID to verify you can access data.

Now you ready to install the frontend plugin.

## Development

You can also serve the plugin in isolation by running `yarn start` in the plugin directory. This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads. It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.
