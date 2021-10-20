import { FormGroupSchema } from 'ng-form-factory';
import { EventsSliderSection } from '@blockframes/admin/cms';
import { events, firestoreQuery } from '../../forms/firestore';
import { matMultiSelect } from '../../forms/select';


export type EventsSliderSchema = FormGroupSchema<EventsSliderSection>;

export const eventsSliderSchema = (): EventsSliderSchema => ({
  form: 'group',
  load: async () => import('./events-slider.component').then(m => m.EventsSliderComponent),
  controls: {
    _type: { form: 'control' },
    eventIds: matMultiSelect<string>({ label: 'Slider ID' }),
    query: firestoreQuery({ collection: 'events' }),
  },
  value: (value: EventsSliderSection) => ({
    _type: 'eventsSlider',
    query: events(),
    ...value
  })
})