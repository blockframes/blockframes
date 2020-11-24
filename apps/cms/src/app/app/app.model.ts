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
    _type: { form: 'control' },
    ...controls,
  } 
})

export const sectionListSchema = (factory: any, value: Section[] = []): FormArraySchema => ({
  form: 'array',
  controls: value.map(v => factory(v)),
  factory
})

export interface App {
  title: string;
  sections: Section[]
}

export const appSchema = (factory: any, value: any): FormGroupSchema<App> => ({
  form: 'group',
  controls: {
    title: { form: 'control' },
    sections: sectionListSchema(factory, value.sections)
  }
});
