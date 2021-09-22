import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { AvailsForm } from '@blockframes/contract/avails/form/avails.form'

@Component({
  selector: 'avails-filter',
  templateUrl: 'avails-filter.component.html',
  styleUrls: ['./avails-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsFilterComponent {
  @Input() form: AvailsForm;
}
