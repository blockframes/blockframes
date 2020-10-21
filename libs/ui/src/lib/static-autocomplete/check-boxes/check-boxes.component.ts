import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { staticModels, staticConsts } from '@blockframes/utils/static-model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: '[form][scope][type] static-check-boxes',
  templateUrl: './check-boxes.component.html',
  styleUrls: ['./check-boxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticCheckBoxesComponent implements OnInit {

  private sub: Subscription;
  @ViewChildren(MatCheckbox) checkboxes: QueryList<MatCheckbox>
  /**
   * The static scope or constant to display
   * @example
   * <static-check-boxes scope="TERRITORIES" ...
   */
  @Input() scope: string;
  @Input() type: 'constant' | 'model' = 'model';

  // The form to connect to
  @Input() form: FormList<string>;

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  public items: SlugAndLabel[];

  ngOnInit() {
    if(this.type === 'constant') {
      this.items = staticConsts[this.scope];
    } else {
      this.items = staticModels[this.scope];
    }

    this.sub = this.form.valueChanges.pipe(
      filter(value => !value.length) // Only trigger when value is empty
    ).subscribe(_ => this.checkboxes.forEach(box => box.checked = false))
  }

  public handleChange({checked, source}: MatCheckboxChange) {
    if (checked) {
      this.form.add(source.value);
      this.form.markAsDirty();
      this.added.emit(source.value);
    } else {
      const index = this.form.controls.findIndex(control => control.value === source.value);
      this.form.removeAt(index);
      if (!this.form.controls.length) {
        this.form.markAsPristine();
      }
      this.removed.emit(index);
    }
  }
}
