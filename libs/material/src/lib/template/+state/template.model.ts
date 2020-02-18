import { TemplateDocument, TemplateDocumentWithDates } from './template.firestore';
import { toDate } from '@blockframes/utils/helpers';

export type Template = TemplateDocumentWithDates;
export type TemplateWithTimestamps = TemplateDocument;

/** A factory function that creates Template */
export function createTemplate(template: Partial<Template>): Template {
  return {
    id : template.id,
    _type: 'templates',
    name: '',
    orgId: template.orgId,
    created: new Date(),
    updated: new Date(),
    ...template
  }
}

/** Convert an TemplateWithTimestamps to an Template (that uses Date). */
export function convertTemplateWithTimestampsToTemplate(
  template: TemplateWithTimestamps
): Template {
  return {
    ...template,
    // Change it for the reusable convert Date function when it's ready
    created: toDate(template.created), // prevent error in case the guard is wrongly called twice in a row
    updated: toDate(template.updated)
  };
}
