import { Material } from "../../material/+state/material.model";

export interface Template {
  id: string;
  name: string;
  materials?: Material[];
  orgId?: string; // only storage in akita store
  orgName?: string; // only storage in akita store
}

export interface TemplateView {
  category: string,
  materials: Material[]
}

export interface TemplatesByOrgs {
  orgName: string,
  templates: Template[]
}


/**
 * A factory function that creates Template
 */
export function createTemplate(template: Partial<Template>) {
  return template ? {
    ...template
  } as Template : {} as Template
}

