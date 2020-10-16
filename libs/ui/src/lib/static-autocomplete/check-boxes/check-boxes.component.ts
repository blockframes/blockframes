import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy, QueryList, ViewChildren
} from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { staticModel, Scope } from '@blockframes/utils/static-model';
import { Subscription } from 'rxjs';

@Component({
  selector: '[form][scope] static-check-boxes',
  templateUrl: './check-boxes.component.html',
  styleUrls: ['./check-boxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticCheckBoxesComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  @ViewChildren(MatCheckbox) checkboxes: QueryList<MatCheckbox>

  /**
   * The static scope or constant to display
   * @example
   * <static-check-boxes scope="territories" ...
   */
  @Input() scope: Scope;

  // The form to connect to
  @Input() form: FormList<string>;

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  public items: any;

  ngOnInit() {
    this.items = staticModel[this.scope];
    this.sub = this.form.valueChanges.subscribe(value => {
      if (!value.length) {
        this.checkboxes.forEach(box => box.checked = false)
      }
    })
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

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }
}
