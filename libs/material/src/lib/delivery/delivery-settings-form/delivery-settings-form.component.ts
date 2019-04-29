import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DeliveryService, Step } from '../+state';

@Component({
  selector: 'delivery-settings-form',
  templateUrl: './delivery-settings-form.component.html',
  styleUrls: ['./delivery-settings-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsFormComponent implements OnInit {
  @Output() cancelled = new EventEmitter();
  @Input() step: Step;

  public form = new FormGroup({
    name: new FormControl(),
    date: new FormControl()
  });

  constructor(private service: DeliveryService) {}

  ngOnInit() {
    if (this.step) {
      this.form.setValue({
        name: this.step.name,
        date: this.step.date
      });
    }
  }

  public cancel() {
    this.cancelled.emit();
  }

  public upsertStep() {
    // If step exists we update step, else we add a new step
    !!this.step
      ? this.service.updateStep(this.step, this.form.value)
      : this.service.createStep(this.form.value);
    this.cancel();
  }
}
