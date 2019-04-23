import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Material, MaterialQuery, MaterialStore } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { takeWhile, filter } from 'rxjs/operators';

@Component({
  selector: 'material-template-add-form',
  templateUrl: './material-template-add-form.component.html',
  styleUrls: ['./material-template-add-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialTemplateAddFormComponent implements OnInit, OnDestroy {
  @Output() material = new EventEmitter<Material>();

  private isAlive = true;

  public form = new FormGroup({
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl()
  });

  constructor(private query: MaterialQuery, private store: MaterialStore) {}

  ngOnInit() {
    this.form.setValue({ value: '', description: '', category: '' });

    this.query
      .select(state => state.materialTemplateForm)
      .pipe(
        takeWhile(() => this.isAlive),
        filter(materialTemplateForm => !!materialTemplateForm)
      )
      .subscribe(materialTemplateForm => this.form.setValue(materialTemplateForm));
  }

  public addMaterial() {
    this.material.emit(this.form.value);
  }

  public cancel() {
    this.store.clearForm();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
