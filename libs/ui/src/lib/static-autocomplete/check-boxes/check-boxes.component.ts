import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { staticConsts, Scope } from '@blockframes/utils/static-model';

@Component({
  selector: '[form][scope] static-check-boxes',
  templateUrl: './check-boxes.component.html',
  styleUrls: ['./check-boxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticCheckBoxesComponent implements OnInit {

  /**
   * The static scope or constant to display
   * @example
   * <static-check-boxes scope="territories" ...
   */
  @Input() scope: Scope;
  @Input() type: 'constant' | 'model' = 'model';

  // The form to connect to
  @Input() form: FormList<string>;

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  public items: any;

  ngOnInit() {
    this.items = staticConsts[this.scope];
  }

  public handleChange({ checked, source }: MatCheckboxChange) {
    if (checked) {
      this.form.add(source.value);
      this.added.emit(source.value);
    } else {
      const index = this.form.controls.findIndex(control => control.value === source.value);
      this.form.removeAt(index);
      this.removed.emit(index);
    }
  }
}
