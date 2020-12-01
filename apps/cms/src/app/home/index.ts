import { bannerSchema } from './banner/banner.component';
import { titlesSchema } from './titles/titles.component';
import { orgsSchema } from './orgs/orgs.component';
import { orgTitleSchema } from './org-titles/org-titles.component';
import { heroSchema } from './hero/hero.component';
import { TemplateParams } from '../template/template.model';

export const sections = (params: TemplateParams) => ({
  banner: bannerSchema,
  titles: titlesSchema(params),
  orgs: orgsSchema(params),
  hero: heroSchema,
  orgTitles: orgTitleSchema,
});