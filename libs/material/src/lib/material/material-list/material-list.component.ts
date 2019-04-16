import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Template } from '../../template/+state';
import { MaterialStore } from '../+state';


@Component({
  selector: 'material-list',
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialListComponent {

  @Input() template: Template;

  constructor(
    private store: MaterialStore,
  ) {}

  public addForm(category: string) {
    this.store.updateEmptyForm(category);
  }
}
