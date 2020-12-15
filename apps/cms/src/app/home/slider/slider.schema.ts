import { FormGroupSchema } from 'ng-form-factory';
import { SliderSection, TemplateParams } from '@blockframes/admin/cms';
import { firestoreQuery, titlesFromApp } from '../../forms/firestore';
import { matMultiSelect } from '../../forms/select';


export type SliderSchema = FormGroupSchema<SliderSection>;

export const sliderSchema = (params: TemplateParams): SliderSchema => ({
  form: 'group',
  load: async () => import('./slider.component').then(m => m.SliderComponent),
  controls: {
    _type: { form: 'control' },
    titleIds: matMultiSelect<string>({ label: 'Slider ID' }),
    query: firestoreQuery({ collection: 'movies' }),
  },
  value: (value: SliderSection) => ({
    _type: 'slider',
    query: titlesFromApp(params.app),
    ...value
  })
})