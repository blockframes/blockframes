import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: '[form][items] static-check-boxes',
  templateUrl: './check-boxes.component.html',
  styleUrls: ['./check-boxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticCheckBoxesComponent {

  /** List of items displayed as checkboxes */
  @Input() items: SlugAndLabel[];

  // The form to connect to
  @Input() form: FormList<string>;

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  public handleChange(change: MatCheckboxChange, index: number) {
    if (change.checked) {
      this.form.add(change.source.value);
      this.added.emit(change.source.value);
    } else {
      this.form.removeAt(index);
      this.removed.emit(index);
    }
  }
}
