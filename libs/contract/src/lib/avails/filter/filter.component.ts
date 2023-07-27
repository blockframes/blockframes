import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { AvailsFilter, waterfallMediaGroups } from '@blockframes/model';
import { AvailsForm, MapAvailsForm, CalendarAvailsForm } from '../form/avails.form';
import { BucketTermForm } from '../../bucket/form';

@Component({
  selector: 'form[availsFilter]',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsFilterComponent {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('availsFilter') form: AvailsForm | MapAvailsForm | CalendarAvailsForm | BucketTermForm;
  @Input() disabled = false;
  @HostBinding('class.vertical') @Input() @boolean vertical: boolean;
  @Output() cleared = new EventEmitter<boolean>();

  public waterfallMediaGroups = waterfallMediaGroups;

  public getControl(key: keyof AvailsFilter) {
    return this.form.controls[key];
  }

  public clear() {
    this.form.reset();
    this.cleared.emit(true);
  }
}
