/**
 * =============================================================================
 * UI5 Web Components – Theme Setup
 * =============================================================================
 *
 * This module initializes the custom "nv_base_theme" by importing the core
 * UI5 assets, the theme loader, and the theme CSS, then activating the theme.
 * It ensures that all UI5 Web Components in the application use the
 * dynamically loaded custom theme.
 *
 * Usage:
 * ```ts
 * // In your root layout (src/app/layout.tsx):
 * import "@/app/theme-setup";
 * ```
 *
 * @module src/app/theme-setup
 */

// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------

/**
 * Theme setter function from UI5 Web Components base library.
 */
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js';

/**
 * Core UI5 Web Components assets (icons, fonts, base styles).
 */
import '@ui5/webcomponents/dist/Assets.js';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

/**
 * Fallback/direct CSS import for the custom theme (optional).
 * This ensures the theme is available during build and SSR.
 */
import '@/styles/nv-base-theme.css';

// -----------------------------------------------------------------------------
// THEME ACTIVATION
// -----------------------------------------------------------------------------

/**
 * Activates the custom theme globally for all UI5 Web Components.
 */
setTheme('sap_horizon'); // Replace with "nv_base_theme" if using a custom theme
