import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, OnDestroy, Input} from '@angular/core';
import { Material, MaterialQuery, MaterialStore } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { takeWhile, filter } from 'rxjs/operators';

@Component({
  selector: 'material-form-delivery',
  templateUrl: './material-form-delivery.component.html',
  styleUrls: ['./material-form-delivery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialFormDeliveryComponent implements OnInit, OnDestroy {
  @Input() isDeliveryValidated: boolean;
  @Output() material = new EventEmitter<Material>();

  steps = [ 'Step 1', 'Step 2', 'Step 3' ];

  private isAlive = true;

  public form = new FormGroup({
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl(),
    step: new FormControl(),
  });

  constructor(private query: MaterialQuery, private store: MaterialStore,) {}

  ngOnInit() {
    this.form.setValue({ value: '', description: '', category: '' });

    this.query
      .select(state => state.form)
      .pipe(
        takeWhile(() => this.isAlive),
        filter(form => !!form)
      )
      .subscribe(form => this.form.setValue(form));
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
