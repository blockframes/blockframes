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
  @Output() cancelForm = new EventEmitter();
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
    this.cancelForm.emit();
  }

  public updateStep() {
    // If step exists we update step, else we add a new step
    if (this.step) {
      this.service.updateStep(this.step, this.form.value);
    } else {
      this.service.addStep(this.form.value);
    }
    this.cancel();
  }
}
