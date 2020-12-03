import { Section, TemplateParams } from '../../template/template.model';
import { firestoreQuery, FirestoreQuery, titlesFromApp } from '../../forms/firestore';
import { FormGroupSchema } from 'ng-form-factory';
import { matMultiSelect } from '../../forms/select';

interface SliderSection extends Section {
  _type: 'slider',
  titleIds: string[];
  query: FirestoreQuery;
}

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