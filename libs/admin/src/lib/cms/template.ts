import { App } from '@blockframes/model';
import { HomeSection } from '@blockframes/admin/cms';


export type CmsPage = CmsTemplate<HomeSection>;
export interface CmsTemplate<S extends Section = Section> {
  id: string;
  title: string;
  sections: S[]
}

export interface TemplateParams {
  app: App,
  page: string;
  template: string;
}

export interface Section {
  _type: string;
}

