import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Delivery } from '../../+state';
import { MatDialog } from '@angular/material/dialog';
import { DeliverySignComponent } from '../delivery-sign/delivery-sign.component';

@Component({
  selector: 'delivery-stakeholder-repertory',
  templateUrl: './stakeholder-repertory.component.html',
  styleUrls: ['./stakeholder-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderRepertoryComponent {

  @Input() delivery: Delivery;
  @Output() signed = new EventEmitter();

  constructor(private dialog: MatDialog,) {}

  public openSignDelivery() {
    this.dialog.open(DeliverySignComponent, {
      width: '600px',
      data: {
        onConfirm: () => this.signDelivery()
      }
    });
  }

  public signDelivery() {
    this.signed.emit();
  }

}
