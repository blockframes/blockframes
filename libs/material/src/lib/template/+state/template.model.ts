import { Material } from '../../material/+state/material.model';
import { firestore } from 'firebase/app';

export interface PartialTemplate {
  id: string;
  name: string;
  orgId: string;
}

export interface Template extends PartialTemplate {
  materials?: Material[];
  created: firestore.Timestamp;
}

export interface TemplateView {
  category: string;
  materials: Material[];
}

/**
 * A factory function that creates Template
 */
export function createTemplate(template: PartialTemplate): Template {
  return {
    ...template,
    created: firestore.Timestamp.now() // TODO: Figure out a way to use FieldValue to get a consistent date.
  };
}
