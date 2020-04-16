import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
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
import { staticModels } from '@blockframes/utils/static-model';

@Component({
  selector: '[form][model] static-check-boxes',
  templateUrl: './check-boxes.component.html',
  styleUrls: ['./check-boxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticCheckBoxesComponent implements OnInit {


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

  ngOnInit() {
    this.items = staticModels[this.model];
  }

  public handleChange({checked, source}: MatCheckboxChange) {
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
