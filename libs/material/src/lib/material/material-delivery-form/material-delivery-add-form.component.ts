import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { Material, MaterialStore } from '../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Step, DeliveryQuery } from '../../delivery/+state';

@Component({
  selector: 'material-delivery-add-form',
  templateUrl: './material-delivery-form.component.html',
  styleUrls: ['./material-delivery-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialDeliveryAddFormComponent implements OnInit {
  @Input() isDeliveryValidated: boolean;
  @Output() add = new EventEmitter<Material>();

  public steps$: Observable<Step[]>;
  public hasStep: boolean;
  public form = new FormGroup({
    value: new FormControl(''),
    description: new FormControl(''),
    category: new FormControl(''),
    stepId: new FormControl('')
  });

  constructor(
    private store: MaterialStore,
    private deliveryQuery: DeliveryQuery
  ) {}

  ngOnInit() {
    this.steps$ = this.deliveryQuery.steps$;
    this.hasStep = this.deliveryQuery.hasStep;
  }

  public updateMaterial() {
    this.add.emit(this.form.value);
  }

  public cancel() {
    this.store.clearForm();
  }

  public get alignement() {
    return this.hasStep
      ? "space-between end"
      : "end end"
  }

}
