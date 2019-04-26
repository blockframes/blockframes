import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
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
  //@Output() cancelForm = new EventEmitter();

  public form = new FormGroup({
    name: new FormControl(),
    date: new FormControl(),
  });

  constructor(private service: DeliveryService) { }

  ngOnInit() {
    console.log(this.step.date)
    this.form.setValue({
      name: this.step.name,
      date: this.step.date,
    });
  }

  public cancel() {
    this.cancelForm.emit();
  }

  public addStep() {
    this.service.addStep(this.form.value);
    this.cancel();
  }

}
