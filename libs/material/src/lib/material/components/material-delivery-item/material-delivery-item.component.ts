import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material } from '../../+state';

@Component({
  selector: 'material-delivery-item',
  templateUrl: './material-delivery-item.component.html',
  styleUrls: ['./material-delivery-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialDeliveryItemComponent {

  @Input() material: Material;
  @Input() isDeliveryValidated: boolean;
  @Input() isChecked: boolean;
  @Output() isSelected = new EventEmitter<boolean>();
  @Output() isDeleted = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();

  constructor() {}

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
