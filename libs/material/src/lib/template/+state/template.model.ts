import { firestore } from 'firebase/app';
import { MaterialTemplate } from '../material/+state';

export interface BaseTemplate {
  id: string;
  name: string;
  orgId: string;
}

export interface Template extends BaseTemplate {
  materials?: MaterialTemplate[];
  created: firestore.Timestamp;
  _type: 'templates';
}

/**
 * A factory function that creates Template
 */
export function createTemplate(template: BaseTemplate) {
  return template?{
    ...(template || {}),
    _type: 'templates',
    created: firestore.Timestamp.now() // TODO: Figure out a way to use FieldValue to get a consistent date.
  } as Template : {} as Template
}
