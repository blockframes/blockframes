import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Material, MaterialQuery } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'material-form',
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialFormComponent implements OnInit, OnDestroy {
  @Output() material = new EventEmitter<Material>();

  private isAlive = true;

  public form = new FormGroup({
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl()
  });

  constructor(private query: MaterialQuery) {}

  ngOnInit() {
    this.form.setValue({ value: '', description: '', category: '' });

    this.query.select(state => state.form).pipe(takeWhile(() => this.isAlive)).subscribe(form =>
      this.form.setValue(form)
    )
  }

  public addMaterial() {
    this.material.emit(this.form.value);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
