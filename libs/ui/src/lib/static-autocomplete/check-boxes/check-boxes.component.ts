import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { staticModels } from '@blockframes/utils/static-model';
import { isArray } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: '[form][model] static-check-boxes',
  templateUrl: './check-boxes.component.html',
  styleUrls: ['./check-boxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticCheckBoxesComponent implements OnInit, OnDestroy {

  /**
   * The static model to display
   * @example
   * <chips-autocomplete model="TERRITORIES" ...
   */
  @Input() model: string;

  // The form to connect to
  @Input() form: FormList<string>;

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  public items: SlugAndLabel[];

  private sub: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.items = staticModels[this.model]

    /** Unchecks checkmarks when value is updated directly on FormList */
    this.sub = this.form.valueChanges.subscribe(res => {
      if (isArray(res) && res.length === 0) {
        this.items.map(item => item.value = false);
        this.cdr.markForCheck();
        this.form.markAsPristine();
      } else {
        this.form.markAsDirty();
      }
    })
  }

  public handleChange({checked, source}: MatCheckboxChange) {
    if (checked) {
      this.form.add(source.name);
      this.added.emit(source.name);
    } else {
      const index = this.form.controls.findIndex(control => control.value === source.name);
      this.form.removeAt(index);
      this.removed.emit(index);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
