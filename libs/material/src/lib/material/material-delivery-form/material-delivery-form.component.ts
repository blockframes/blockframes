import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input} from '@angular/core';
import { Material } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';

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

  public steps = [ 'Step 1', 'Step 2', 'Step 3' ];

  public form = new FormGroup({
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl(),
    step: new FormControl(),
  });

  constructor() {}

  ngOnInit() {
    this.form.setValue({
      value: this.material.value,
      description: this.material.description,
      category: this.material.category,
      step: this.material.step,
    });
  }

  public updateMaterial() {
    this.update.emit({...this.material, ...this.form.value});
    this.cancel();
  }

  public cancel() {
    this.cancelForm.emit();
  }
}
