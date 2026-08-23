/**
 * The shared Maison header web components, served by the portal
 * ({PORTAL_URL}/app-switcher.js) and used as plain custom elements.
 */
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "maison-app-switcher": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "portal-url"?: string;
      };
      "maison-account-badge": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "portal-url"?: string;
      };
      "maison-org-switcher": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "portal-url"?: string;
      };
      "maison-theme-toggle": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "portal-url"?: string;
      };
    }
  }
}
