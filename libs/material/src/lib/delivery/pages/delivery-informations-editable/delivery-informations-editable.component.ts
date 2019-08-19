import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Delivery, DeliveryQuery, DeliveryService } from '../../+state';
import { FormGroup, FormControl } from '@angular/forms';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'delivery-informations-editable',
  templateUrl: './delivery-informations-editable.component.html',
  styleUrls: ['./delivery-informations-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsEditableComponent implements OnInit {
  public opened = false;

  public informationsFormGroup = new FormGroup({
    deliveryDates: new FormGroup({
      dueDate: new FormControl(null),
      acceptationPeriod: new FormControl(null),
      reWorkingPeriod: new FormControl(null)
    })
  });

  public delivery$: Observable<Delivery>;

  constructor(private query: DeliveryQuery, private service: DeliveryService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.delivery$ = this.query.selectActive().pipe(
      tap(delivery =>
        this.deliveryDates.patchValue(delivery)
      ),
      switchMap(delivery => this.deliveryDates.valueChanges.pipe(startWith(delivery)))
    );
  }

  get deliveryDates() {
    return this.informationsFormGroup.get('deliveryDates');
  }

  public openSidenav() {
    this.opened = true;
  }

  public updateInformations() {
    try {
      this.service.updateDates(this.deliveryDates.value);
      this.snackBar.open('Informations updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
