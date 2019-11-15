import { TemplateDocument } from './template.firestore';
import { firestore } from 'firebase/app';

export type Template = TemplateDocument;

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
