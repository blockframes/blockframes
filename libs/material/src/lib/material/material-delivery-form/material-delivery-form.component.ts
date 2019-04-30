import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { Material } from '../+state';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl(),
    stepId: new FormControl('', [Validators.required])
  });

  constructor(private deliveryQuery: DeliveryQuery) {}

  ngOnInit() {
    this.steps$ = this.deliveryQuery.steps$;
    this.form.setValue({
      value: this.material.value,
      description: this.material.description,
      category: this.material.category,
      stepId: this.material.step.id
    });
  }

  public updateMaterial() {
    if (this.form.valid) {
      this.update.emit({ ...this.material, ...this.form.value });
      this.cancel();
    }
  }

  public cancel() {
    this.cancelForm.emit();
  }
}
