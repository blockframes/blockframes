import { Material } from '../../material/+state/material.model';
import { firestore } from 'firebase/app';

export interface BaseTemplate {
  id: string;
  name: string;
  orgId: string;
}

export interface Template extends BaseTemplate {
  materials?: Material[];
  created: firestore.Timestamp;
  collectionName: 'movies' | 'templates' | 'deliveries';
}

export interface TemplateView {
  category: string;
  materials: Material[];
}

/**
 * A factory function that creates Template
 */
export function createTemplate(template: BaseTemplate) {
  return template?{
    ...(template || {}),
    collectionName: 'templates',
    created: firestore.Timestamp.now() // TODO: Figure out a way to use FieldValue to get a consistent date.
  } as Template : {} as Template
}
