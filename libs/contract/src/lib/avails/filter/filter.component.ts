
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

import { boolean } from '@blockframes/utils/decorators/decorators';

import { AvailsFilter } from '../avails';
import { AvailsForm, MapAvailsForm, CalendarAvailsForm } from '../form/avails.form';

@Component({
  selector: 'form[availsFilter]',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsFilterComponent {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('availsFilter') form: AvailsForm | MapAvailsForm | CalendarAvailsForm;
  @HostBinding('class.vertical') @Input() @boolean vertical: boolean;

  public safeGet(key: keyof AvailsFilter) {
    // if we don't cast the type, we get a type error
    // this is probably caused by the way the FormEntity is typed
    return (this.form as AvailsForm).get(key);
  }
}
