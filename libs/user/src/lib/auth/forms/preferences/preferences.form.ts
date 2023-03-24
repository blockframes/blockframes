import { UntypedFormControl } from '@angular/forms';
import { createPreferences, Preferences, GetKeys } from '@blockframes/model';
import { FormList, FormStaticValueArray } from '@blockframes/utils/form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createPreferencesControls(entity: Partial<Preferences> = {}) {
  const preferences = createPreferences(entity);

  return {
    territories: new FormStaticValueArray<'territories'>(preferences.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(preferences.medias, 'medias'),
    languages: FormList.factory<GetKeys<'languages'>>(preferences.languages, el => new UntypedFormControl(el)),
    genres: FormList.factory<GetKeys<'genres'>>(preferences.genres, el => new UntypedFormControl(el))
  }
}

type NotificationsControl = ReturnType<typeof createPreferencesControls>;

export class PreferencesForm extends FormEntity<NotificationsControl, Preferences> {
  constructor(data: Partial<Preferences> = {}) {
    super(createPreferencesControls(data))
  }
}
