import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Material } from '../+state';

@Component({
  selector: 'material-delivery-item',
  templateUrl: './material-delivery-item.component.html',
  styleUrls: ['./material-delivery-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialDeliveryItemComponent implements OnChanges {

  @Input() material: Material;
  @Input() isDeliveryValidated: boolean;
  @Input() allChecked: boolean;
  @Output() isSelected = new EventEmitter<boolean>();
  @Output() isDeleted = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();

  public isChecked = false;

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

  ngOnChanges(){
    this.isChecked = this.allChecked;
  }

}
