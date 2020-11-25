import { bannerSchema } from './banner/banner.component';
import { titlesSchema } from './titles/titles.component';
import { orgsSchema } from './orgs/orgs.component';
import { orgTitleSchema } from './org-titles/org-titles.component';
import { heroSchema } from './hero/hero.component';

export const sections = {
  banner: bannerSchema,
  titles: titlesSchema,
  orgs: orgsSchema,
  hero: heroSchema,
  featureOrg: orgTitleSchema,
} as const;