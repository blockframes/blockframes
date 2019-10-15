import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { materialStatuses, MaterialStatus } from '../../../material/+state';

@Component({
  selector: 'delivery-actions',
  templateUrl: './delivery-actions.component.html',
  styleUrls: ['./delivery-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryActionsComponent{
  @Output() status = new EventEmitter<MaterialStatus>();
  @Output() paid = new EventEmitter<void>();
  @Output() ordered = new EventEmitter<void>();

  public statuses = materialStatuses;

  public changeStatus(newStatus: MaterialStatus) {
    this.status.emit(newStatus);
  }


}
