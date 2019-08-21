import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Delivery, DeliveryQuery, DeliveryService } from '../../+state';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { createInformationsFormGroup } from '../../forms/informations.form';

@Component({
  selector: 'delivery-informations-editable',
  templateUrl: './delivery-informations-editable.component.html',
  styleUrls: ['./delivery-informations-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsEditableComponent implements OnInit {
  public opened = false;
  public editContent = 'dates';

  public informationsFormGroup = createInformationsFormGroup();

  public delivery$: Observable<Delivery>;

  constructor(
    private query: DeliveryQuery,
    private service: DeliveryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.delivery$ = this.query.selectActive().pipe(
      tap(delivery => {
        this.deliveryDates.patchValue(delivery);
        this.deliverySteps.patchValue(delivery.steps);
      }),
      switchMap(delivery => this.deliveryDates.valueChanges.pipe(startWith(delivery)))
    );
  }

  get deliveryDates() {
    return this.informationsFormGroup.get('deliveryDates');
  }

  get deliverySteps() {
    return this.informationsFormGroup.get('deliverySteps');
  }

  public get steps$() {
    return this.deliverySteps.valueChanges.pipe(startWith(this.deliverySteps.value));
  }

  public openSidenav(name: string) {
    this.editContent = name;
    this.opened = true;
  }

  public async updateInformations() {
    // TODO: update guaranteed minimum payment deadline informations: issue#764
    try {
      if (this.informationsFormGroup.invalid) throw new Error('Delivery informations are not valid');
      await this.service.updateInformations(this.deliveryDates.value, this.deliverySteps.value);
      this.snackBar.open('Informations updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
