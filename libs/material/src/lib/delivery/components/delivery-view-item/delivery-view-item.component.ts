import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material } from '../../../material/+state';

@Component({
  selector: 'delivery-view-item',
  templateUrl: './delivery-view-item.component.html',
  styleUrls: ['./delivery-view-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewItemComponent {
  @Input() material: Material;
  @Input() isChecked: boolean;
  @Output() isSelected = new EventEmitter<boolean>();

  public isOpen = true;
  public disableMaterial = false;
  public panelButtonLabel = 'LESS';
  public disableButtonLabel = 'DISABLE';

  constructor() {}

  public selectMaterial() {
    this.isSelected.emit(!this.isChecked);
  }

  public panelToggle() {
    this.isOpen = !this.isOpen;
    !!this.isOpen ? (this.panelButtonLabel = 'LESS') : (this.panelButtonLabel = 'MORE');
  }

  public disableToggle() {
    this.disableMaterial = !this.disableMaterial;
    this.isOpen = false;
    this.panelButtonLabel = 'MORE';
    !!this.disableMaterial
      ? (this.disableButtonLabel = 'ENABLE')
      : (this.disableButtonLabel = 'DISABLE');
  }
}
