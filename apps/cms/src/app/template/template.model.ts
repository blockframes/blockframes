import { App } from '@blockframes/utils/apps';
import { FormArraySchema, FormGroupSchema } from 'ng-form-factory';

export interface TemplateParams {
  app: App,
  page: string;
  template: string;
}

export interface Section {
  _type: string;
}

export const sectionSchema = <S extends Section>(
  load: string,
  controls: Partial<Record<keyof S, any>>
): FormGroupSchema<S> => ({
  form: 'group',
  load,
  controls: {
    ...controls,
    _type: { form: 'control' },
  } 
})

export const sectionListSchema = (factory: any, value: Section[] = []): FormArraySchema => ({
  form: 'array',
  controls: [],
  factory,
  value
})

export interface CmsTemplate {
  id: string;
  title: string;
  sections: Section[]
}

export const templateSchema = (factory: any, value: any): FormGroupSchema<CmsTemplate> => ({
  form: 'group',
  controls: {
    title: { form: 'control' },
    sections: sectionListSchema(factory, value.sections)
  }
});
