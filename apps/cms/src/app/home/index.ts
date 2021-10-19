import { BannerSection, HeroSection, OrgTitlesSection, TemplateParams } from '@blockframes/admin/cms';
import { bannerSchema } from './banner/banner.component';
import { TitlesSchema, titlesSchema } from './titles/titles.component';
import { OrgsSchema, orgsSchema } from './orgs/orgs.component';
import { orgTitleSchema } from './org-titles/org-titles.component';
import { heroSchema } from './hero/hero.component';
import { SliderSchema, sliderSchema } from './slider/slider.schema';
import { EventsSliderSchema, eventsSliderSchema } from './events-slider/events-slider.schema';
import { FormGroupSchema } from 'ng-form-factory';

interface Sections {
  banner: FormGroupSchema<BannerSection>;
  titles: TitlesSchema;
  slider: SliderSchema;
  orgs: OrgsSchema;
  hero: FormGroupSchema<HeroSection>;
  orgTitles: FormGroupSchema<OrgTitlesSection>;
  eventsSlider?: EventsSliderSchema;
}

export const sections = (params: TemplateParams) => {
  const sections: Sections = {
    banner: bannerSchema,
    titles: titlesSchema(params),
    slider: sliderSchema(params),
    orgs: orgsSchema(params),
    hero: heroSchema,
    orgTitles: orgTitleSchema,
  }
  if (params.app === 'festival') {
    sections.eventsSlider = eventsSliderSchema();
  }
  return sections;
};