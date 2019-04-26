import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Step, DeliveryService } from '../+state';

@Component({
  selector: 'delivery-settings-item',
  templateUrl: './delivery-settings-item.component.html',
  styleUrls: ['./delivery-settings-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsItemComponent implements OnInit {
  @Input() step: Step;
  @Output() update = new EventEmitter();

  constructor(private service: DeliveryService) { }

  ngOnInit() {
  }

  public edit() {
    this.update.emit();
  }

  public removeStep() {
    this.service.removeStep(this.step);
  }

}
