import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { AvailsForm } from '@blockframes/contract/avails/form/avails.form'

@Component({
  selector: 'avails-title-filter',
  templateUrl: 'avails-title-filter.component.html',
  styleUrls: ['./avails-title-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailsTitleFilterComponent {
  @Input() form: AvailsForm
}