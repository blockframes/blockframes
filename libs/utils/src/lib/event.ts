import { AnonymousCredentials } from "@blockframes/auth/+state/auth.store";
import { AccessibilityTypes } from "./static-model/types";

export type TabConfig = { path: string, label: string };
export type NavTabs = { screening: TabConfig[], meeting: TabConfig[] };

/**
 * Check if anonymous user has given enough informations to access event
 * @param creds 
 * @param accessibility 
 * @returns 
 */
export function hasAnonymousIdentity(creds: AnonymousCredentials, accessibility?: AccessibilityTypes) {
  const hasIdentity = !!creds?.lastName && !!creds?.firstName && !!creds?.role;
  return (accessibility === 'public' || !accessibility) ? hasIdentity : hasIdentity && !!creds?.email;
}