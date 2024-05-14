"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const dev_utils_1 = require("@backstage/dev-utils");
const plugin_1 = require("../src/plugin");
(0, dev_utils_1.createDevApp)()
    .registerPlugin(plugin_1.endorFrontendPlugin)
    .addPage({
    element: react_1.default.createElement(plugin_1.EndorFrontendPage, null),
    title: 'Root Page',
    path: '/endor',
})
    .render();
