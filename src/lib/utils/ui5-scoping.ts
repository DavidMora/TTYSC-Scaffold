/**
 * UI5 Web Components Scoping Configuration
 * 
 * This file configures scoping for UI5 Web Components to prevent
 * conflicts between multiple runtimes or versions.
 * 
 * @see https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/06-scoping.md
 */

import { setCustomElementsScopingSuffix } from "@ui5/webcomponents-base/dist/CustomElementsScope.js";

/**
 * Set a unique scoping suffix for this application
 * This prevents conflicts with other UI5 applications or libraries
 */
const SCOPING_SUFFIX = "ttysc-app";

// Apply scoping before any UI5 components are loaded
setCustomElementsScopingSuffix(SCOPING_SUFFIX);

console.log(`UI5 Web Components scoped with suffix: ${SCOPING_SUFFIX}`);
