import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnDestroy,
  Input
} from '@angular/core';
import { Material, MaterialQuery, MaterialStore } from '../+state';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  public hasStep: boolean;
  private isAlive = true;
  public form: FormGroup;

  constructor(
    private query: MaterialQuery,
    private store: MaterialStore,
    private deliveryQuery: DeliveryQuery
  ) {}

  ngOnInit() {
    this.steps$ = this.deliveryQuery.steps$;
    if (this.deliveryQuery.getActive().steps.length > 0) {
      this.form = this.createFormWithStep();
      this.hasStep = true;
    } else {
      this.form = this.createFormWithoutStep();
      this.hasStep = false;
    }

    this.query
      .select(state => state.materialDeliveryForm)
      .pipe(
        takeWhile(() => this.isAlive),
        filter(materialDeliveryForm => !!materialDeliveryForm)
      )
      .subscribe(materialDeliveryForm => {
        const form = {...materialDeliveryForm};
        // If the delivery doesn't have steps : don't set stepId to form
        if (!this.hasStep) delete form.stepId;
        return this.form.setValue(form);
      });
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
    this.material.emit(this.form.value);
  }

  public cancel() {
    this.store.clearForm();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
