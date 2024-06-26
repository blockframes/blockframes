import { UntypedFormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormStaticValueArray } from '@blockframes/utils/form/forms/static-value.form';
import { compareDates, isDateInFuture } from '@blockframes/utils/form/validators/validators';
import { Duration, Territory, AvailsFilter, BaseAvailsFilter, CalendarAvailsFilter, MapAvailsFilter, createDuration } from '@blockframes/model';

export function createAvailsSearch(search: Partial<AvailsFilter> = {}): AvailsFilter {

  return {
    exclusive: false,
    ...search,
    territories: search.territories?.length ? search.territories: [],
    medias: search.medias?.length ? search.medias: [],
    duration: createDuration(search?.duration),
  };
}

function createDurationControl(duration: Partial<{ from: Date, to: Date }> = {}) {

  const date = new Date(); //--/--/--:--:--:--

  const from = duration.from ?? new Date(date.getFullYear(), date.getMonth(), date.getDate());//--/--/--:0:0:0:0
  const to = duration.to ?? new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());//--/--/--:0:0:0:0

  const fromValidators = [compareDates('from', 'to', 'from'), isDateInFuture, Validators.required];
  const toValidators = [compareDates('from', 'to', 'to'), isDateInFuture, Validators.required];

  return {
    from: new UntypedFormControl(from, fromValidators),
    to: new UntypedFormControl(to, toValidators)
  };
}

type DurationControl = ReturnType<typeof createDurationControl>;

class DurationForm extends FormEntity<DurationControl, Duration> {
  constructor(duration: Partial<Duration> = {}) {
    super(createDurationControl(duration));
  }
}


function createTerritoriesControl(territories: Territory[] = []) {
  return new FormStaticValueArray<'territories'>(territories, 'territories', [Validators.required]);
}

function createBaseAvailControl(avail: Partial<BaseAvailsFilter> = {}) {
  return {
    medias: new FormStaticValueArray<'medias'>(avail.medias || [], 'medias', [Validators.required, Validators.minLength(0)]),
    exclusive: new UntypedFormControl(avail.exclusive ?? true, Validators.required),
  };
}

// ----------------------------
//              MAP
// ----------------------------

function createMapAvailControl(avail: Partial<MapAvailsFilter> = {}) {
  return {
    ...createBaseAvailControl(avail),
    duration: new DurationForm(avail.duration),
  }
}

export type MapAvailControl = ReturnType<typeof createMapAvailControl>;

export class MapAvailsForm extends FormEntity<MapAvailControl, MapAvailsFilter> {
  constructor(avail: Partial<MapAvailsFilter> = {}) {
    super(createMapAvailControl(avail));
  }
}

// ----------------------------
//           CALENDAR
// ----------------------------


function createCalendarAvailControl(avail: Partial<CalendarAvailsFilter> = {}) {
  return {
    ...createBaseAvailControl(avail),
    territories: createTerritoriesControl(avail.territories),
  }
}

export type CalendarAvailControl = ReturnType<typeof createCalendarAvailControl>;

export class CalendarAvailsForm extends FormEntity<CalendarAvailControl, CalendarAvailsFilter> {
  constructor(avail: Partial<CalendarAvailsFilter> = {}) {
    super(createCalendarAvailControl(avail));
  }
}

// ----------------------------
//         FULL AVAILS
// ----------------------------

function createAvailControl(avail: Partial<AvailsFilter> = {}) {
  return {
    ...createBaseAvailControl(avail),
    territories: createTerritoriesControl(avail.territories),
    duration: new DurationForm(avail.duration),
  }
}

export type AvailControl = ReturnType<typeof createAvailControl>;

export class AvailsForm extends FormEntity<AvailControl, AvailsFilter> {
  constructor(avail: Partial<AvailsFilter> = {}) {
    super(createAvailControl(avail));
  }
}
