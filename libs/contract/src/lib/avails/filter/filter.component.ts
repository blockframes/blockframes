import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { AvailsForm, AvailControl } from '../form/avails.form';

type AvailsKeys = keyof AvailControl;
type AvailsRecord = Partial<Record<AvailsKeys, boolean>>;
function toRecord(value: AvailsKeys | AvailsKeys[]): AvailsRecord {
  const keys = (Array.isArray(value)) ? value : [value];
  const result = {};
  for (const key of ['territories', 'medias', 'duration', 'exclusive'] as const) {
    result[key] = keys.includes(key);
  }
  return result;
}

@Component({
  selector: 'form[availsFilter]',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsFilterComponent {
  hideKeys: AvailsRecord = {};
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('availsFilter') form: AvailsForm;
  @HostBinding('class.vertical') @Input() @boolean vertical: boolean;
  @Input() @boolean required: boolean;
  @Input() set hide(keys: AvailsKeys | AvailsKeys[]) {
    if (!keys) return;
    this.hideKeys = toRecord(keys);
  }
}
