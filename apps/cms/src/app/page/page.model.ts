import { FormArraySchema, FormGroupSchema } from 'ng-form-factory';

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
  controls: value.map(v => factory(v)),
  factory
})

export interface Page {
  title: string;
  sections: Section[]
}

export const pageSchema = (factory: any, value: any): FormGroupSchema<Page> => ({
  form: 'group',
  controls: {
    title: { form: 'control' },
    sections: sectionListSchema(factory, value.sections)
  }
});
