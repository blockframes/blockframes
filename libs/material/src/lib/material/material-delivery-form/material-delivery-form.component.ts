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

  public form: FormGroup;

  public hasStep: boolean;

  constructor(private deliveryQuery: DeliveryQuery) {}

  ngOnInit() {
    this.steps$ = this.deliveryQuery.steps$;
    this.hasStep = this.deliveryQuery.hasStep;
    this.form = new FormGroup({
      value: new FormControl(this.material.value),
      description: new FormControl(this.material.description),
      category: new FormControl(this.material.category),
      stepId: new FormControl(this.material.stepId)
    });
  }

  public updateMaterial() {
    this.update.emit({ ...this.form.value, id: this.material.id });
    this.cancel();
  }

  public cancel() {
    this.cancelForm.emit();
  }

  public get alignement() {
    return this.hasStep
      ? "space-between end"
      : "end end"
  }
}
