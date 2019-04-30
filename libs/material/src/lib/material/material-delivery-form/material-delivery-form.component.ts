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

    if (this.deliveryQuery.getActive().steps.length > 0) {
      this.form = this.createFormWithStep();
      this.hasStep = true;
      this.setForm(this.material);
    } else {
      this.form = this.createFormWithoutStep();
      this.hasStep = false;
      this.setForm();
    }
  }

  private setForm(material?: Material) {
    // If the delivery doesn't have steps : don't set stepId to form
    if (!material) {
      this.form.setValue({
        value: this.material.value,
        description: this.material.description,
        category: this.material.category
      });
    } else {
      // If the material has a step
      if (material.step) {
        this.form.setValue({
          value: this.material.value,
          description: this.material.description,
          category: this.material.category,
          stepId: this.material.step.id
        });
        // If the material doesn't have a step
      } else {
        this.form.setValue({
          value: this.material.value,
          description: this.material.description,
          category: this.material.category,
          stepId: ''
        });
      }
    }
  }

  private createFormWithStep() {
    return new FormGroup({
      value: new FormControl(''),
      description: new FormControl(''),
      category: new FormControl(''),
      stepId: new FormControl('')
    });
  }

  private createFormWithoutStep() {
    return new FormGroup({
      value: new FormControl(''),
      description: new FormControl(''),
      category: new FormControl('')
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
