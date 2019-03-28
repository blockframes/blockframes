import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material, MaterialService, MaterialQuery, createMaterial } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { PersistNgFormPlugin } from '@datorama/akita';

@Component({
  selector: 'material-form',
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialFormComponent implements OnInit {

  @Output() material = new EventEmitter<Material>();

  public form = new FormGroup({
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl(),
  });

  public persistForm: PersistNgFormPlugin<Material>;

  constructor(
    private query: MaterialQuery,
  ) { }

  ngOnInit() {
    this.form.setValue({value: "", description: "", category: ""});

    this.persistForm = new PersistNgFormPlugin(this.query, createMaterial).setForm(this.form);
  }

  addMaterial() {
    this.material.emit(this.form.value);
    this.persistForm.reset();
}

  // public deleteMaterial() {
  //   this.service.deleteMaterial(this.material.id);
  // }

  // public updateMaterial() {
  //   this.service.updateMaterial(this.material, this.form.value);
  // }

  // public addMaterial() {
  //   this.service.addMaterial(this.material.category);
  // }


}
