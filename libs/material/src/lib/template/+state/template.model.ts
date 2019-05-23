import { Material } from "../../material/+state/material.model";
import { firestore } from 'firebase/app';

export interface PartialTemplate {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
}

export interface Template extends PartialTemplate {
  materials?: Material[];
  created: any; // TODO: switch to firestore.Timestamp as soon as possible
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
export function createTemplate(template: PartialTemplate): Template {
  return {
    ...template,
    created: new Date()
  }
}

