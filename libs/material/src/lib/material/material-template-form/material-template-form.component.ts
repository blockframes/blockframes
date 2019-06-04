import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input} from '@angular/core';
import { Material } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'material-template-form',
  templateUrl: './material-template-form.component.html',
  styleUrls: ['./material-template-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialTemplateFormComponent implements OnInit {
  @Input() material: Material;
  @Output() update = new EventEmitter<Material>();
  @Output() canceled = new EventEmitter();

  public form = new FormGroup({
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl()
  });

  constructor() {}

  ngOnInit() {
    this.form.setValue({
      value: this.material.value,
      description: this.material.description,
      category: this.material.category
    });
  }

  public updateMaterial() {
    this.update.emit({...this.material, ...this.form.value});
    this.cancel();
  }

  public cancel() {
    this.canceled.emit();
  }
}
