import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { endorFrontendPlugin, EndorFrontendPage } from '../src/plugin';

createDevApp()
  .registerPlugin(endorFrontendPlugin)
  .addPage({
    element: <EndorFrontendPage />,
    title: 'Root Page',
    path: '/endor',
  })
  .render();
