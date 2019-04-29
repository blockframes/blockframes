import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Material } from '../+state';
import { Step, DeliveryQuery } from '../../delivery/+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'material-delivery-item',
  templateUrl: './material-delivery-item.component.html',
  styleUrls: ['./material-delivery-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialDeliveryItemComponent implements OnInit {

  @Input() material: Material;
  @Input() isDeliveryValidated: boolean;
  @Output() isDeleted = new EventEmitter();
  @Output() update = new EventEmitter();

  public step$: Observable<Step>;

  constructor(private deliveryQuery: DeliveryQuery,) {}

  ngOnInit() {
    this.step$ = this.deliveryQuery.getStep$(this.material.step);
  }

  public deleteMaterial() {
    this.isDeleted.emit();
  }

  public editMaterial() {
    this.update.emit();
  }

}
