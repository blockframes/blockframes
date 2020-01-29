import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Template, TemplateWithTimestamps, convertTemplateWithTimestampsToTemplate } from './template.model';

export interface TemplateState extends EntityState<Template>, ActiveState<string> {
  form : Template;
}

const initialState = {
  form: null
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'templates', idKey: 'id' })
export class TemplateStore extends EntityStore<TemplateState, Template> {

  constructor() {
    super(initialState);
  }

  akitaPreAddEntity(template: TemplateWithTimestamps): Template {
    return convertTemplateWithTimestampsToTemplate(template);
  }

  akitaPreUpdateEntity(template: Template, nextTemplate: TemplateWithTimestamps) {
    return convertTemplateWithTimestampsToTemplate(nextTemplate);
  }
}
