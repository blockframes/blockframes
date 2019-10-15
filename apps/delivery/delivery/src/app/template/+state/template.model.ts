import { firestore } from 'firebase/app';
import { MaterialTemplate } from '../../material/+state';
import { TemplateDocument } from './template.firestore';

/** Template interface with materials (used by the guard). */
export interface Template extends TemplateDocument {
  materials?: MaterialTemplate[];
}

/** A factory function that creates Template */
export function createTemplate(template: Partial<Template>): Template {
  return {
    id : template.id,
    _type: 'templates',
    name: '',
    orgId: template.orgId,
    created: firestore.Timestamp.now(),
    ...template
  }
}
