import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Step, DeliveryService } from '../+state';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'delivery-settings-item',
  templateUrl: './delivery-settings-item.component.html',
  styleUrls: ['./delivery-settings-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsItemComponent {
  @Input() step: Step;
  @Output() update = new EventEmitter();

  constructor(private service: DeliveryService, private snackbar: MatSnackBar) { }

  public edit() {
    this.update.emit();
  }

  public removeStep() {
    this.service.removeStep(this.step);
    this.snackbar.open(`Step "${this.step}" has been removed`, 'close', { duration: 2000 })
  }
}
