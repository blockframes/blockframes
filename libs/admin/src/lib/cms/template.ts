import { App } from '@blockframes/utils/apps';

export interface CmsTemplate {
  id: string;
  title: string;
  sections: Section[]
}

export interface TemplateParams {
  app: App,
  page: string;
  template: string;
}

export interface Section {
  _type: string;
}

