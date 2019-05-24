import { Material } from "../../material/+state/material.model";
import { firestore } from 'firebase/app';
import { FieldValue } from "@google-cloud/firestore";

export interface PartialTemplate {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
}

export interface Template extends PartialTemplate {
  materials?: Material[];
  created: firestore.Timestamp | FieldValue;
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
    created: firestore.FieldValue.serverTimestamp()
  }
}

