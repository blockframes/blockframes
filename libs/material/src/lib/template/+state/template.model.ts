import { TemplateDocument, TemplateDocumentWithDates } from './template.firestore';

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
    created: (template.created instanceof Date) ? template.created : template.created.toDate(), // prevent error in case the guard is wrongly called twice in a row
    updated: (template.updated instanceof Date) ? template.updated : template.updated.toDate()
  };
}
