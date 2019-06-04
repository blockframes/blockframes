import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material } from '../../+state';

@Component({
  selector: 'material-template-item',
  templateUrl: './material-template-item.component.html',
  styleUrls: ['./material-template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialTemplateItemComponent {

  @Input() material: Material;
  @Input() isChecked: boolean;
  @Output() isSelected = new EventEmitter<boolean>();
  @Output() isDeleted = new EventEmitter();
  @Output() update = new EventEmitter();

  constructor(
  ) { }

  public selectMaterial() {
    this.isSelected.emit(!this.isChecked);
  }

  public deleteMaterial() {
    this.isDeleted.emit();
  }

  public editMaterial() {
    this.update.emit();
  }

}
