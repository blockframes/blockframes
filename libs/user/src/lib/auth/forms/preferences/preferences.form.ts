import { FormControl } from '@angular/forms';
import { createPreferences, Preferences } from '@blockframes/shared/model';
import { FormList, FormStaticValueArray } from '@blockframes/utils/form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { GetKeys } from '@blockframes/shared/model';

function createPreferencesControls(entity: Partial<Preferences> = {}) {
  const preferences = createPreferences(entity);

  return {
    territories: new FormStaticValueArray<'territories'>(preferences.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(preferences.medias, 'medias'),
    languages: FormList.factory<GetKeys<'languages'>>(preferences.languages, el => new FormControl(el)),
    genres: FormList.factory<GetKeys<'genres'>>(preferences.genres, el => new FormControl(el)),
  };
}

type NotificationsControl = ReturnType<typeof createPreferencesControls>;

export class PreferencesForm extends FormEntity<NotificationsControl, Preferences> {
  constructor(data: Partial<Preferences> = {}) {
    super(createPreferencesControls(data));
  }
}
