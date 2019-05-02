import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { Material } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Step, DeliveryQuery } from '../../delivery/+state';

@Component({
  selector: 'material-delivery-form',
  templateUrl: './material-delivery-form.component.html',
  styleUrls: ['./material-delivery-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialDeliveryFormComponent implements OnInit {
  @Input() isDeliveryValidated: boolean;
  @Input() material: Material;
  @Output() update = new EventEmitter<Material>();
  @Output() cancelForm = new EventEmitter();

  public steps$: Observable<Step[]>;

  public form = new FormGroup({
    value: new FormControl(''),
    description: new FormControl(''),
    category: new FormControl(''),
    stepId: new FormControl('')
  });
  public hasStep: boolean;

  constructor(private deliveryQuery: DeliveryQuery) {}

  ngOnInit() {
    this.steps$ = this.deliveryQuery.steps$;
    this.hasStep = this.deliveryQuery.hasStep;
    this.setForm();
  }

  private setForm() {
    this.form.setValue({
      value: this.material.value,
      description: this.material.description,
      category: this.material.category,
      stepId: this.material.stepId
    });
  }

  public updateMaterial() {
    this.update.emit({ ...this.form.value, id: this.material.id });
    this.cancel();
  }

  public cancel() {
    this.cancelForm.emit();
  }
}
