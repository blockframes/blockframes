import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material } from '../../material/+state';

@Component({
  selector: 'delivery-view-item',
  templateUrl: './delivery-view-item.component.html',
  styleUrls: ['./delivery-view-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewItemComponent implements OnInit {
  @Input() material: Material;
  @Input() isChecked: boolean;
  @Output() isSelected = new EventEmitter<boolean>();

  // Visual bullshit for WoW effect
  public paymentIcons = ['dummy', 'payed', 'not_payed'];
  public stateIcon: string;
  public paymentIcon: string;

  public isOpen = true;
  public disableMaterial = false;
  public panelButtonLabel = 'LESS';
  public disableButtonLabel = 'DISABLE';

  constructor() {}

  ngOnInit() {
    this.paymentIcon = this.paymentIcons[this.randomNumberPicker(2)];
  }

  public selectMaterial() {
    this.isSelected.emit(!this.isChecked);
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
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
