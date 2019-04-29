import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, OnDestroy, Input} from '@angular/core';
import { Material, MaterialQuery, MaterialStore } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { takeWhile, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Step, DeliveryQuery } from '../../delivery/+state';

@Component({
  selector: 'material-delivery-add-form',
  templateUrl: './material-delivery-form.component.html',
  styleUrls: ['./material-delivery-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialDeliveryAddFormComponent implements OnInit, OnDestroy {
  @Input() isDeliveryValidated: boolean;
  @Output() material = new EventEmitter<Material>();

  public steps$: Observable<Step[]>;

  private isAlive = true;

  public form = new FormGroup({
    value: new FormControl(),
    description: new FormControl(),
    category: new FormControl(),
    step: new FormControl(),
  });

  constructor(private query: MaterialQuery, private store: MaterialStore, private deliveryQuery: DeliveryQuery,) {}

  ngOnInit() {
    this.steps$ = this.deliveryQuery.steps$;
    this.form.setValue({ value: '', description: '', category: '', step: '' });

    this.query
      .select(state => state.materialDeliveryForm)
      .pipe(
        takeWhile(() => this.isAlive),
        filter(materialDeliveryForm => !!materialDeliveryForm)
      )
      .subscribe(materialDeliveryForm => this.form.setValue(materialDeliveryForm));
  }

  public updateMaterial() {
    this.material.emit(this.form.value);
  }

  public cancel() {
    this.store.clearForm();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
