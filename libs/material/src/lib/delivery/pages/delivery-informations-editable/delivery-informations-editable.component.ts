import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { createInformationsFormGroup } from '../../forms/informations.form';
import { Delivery } from '../../+state/delivery.model';
import { DeliveryQuery } from '../../+state/delivery.query';
import { DeliveryService } from '../../+state/delivery.service';

@Component({
  selector: 'delivery-informations-editable',
  templateUrl: './delivery-informations-editable.component.html',
  styleUrls: ['./delivery-informations-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsEditableComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'delivery-informations-editable';

  public opened = false;
  public editContent = 'dates';

  public informationsFormGroup = createInformationsFormGroup();

  public deliveryInformations$: Observable<Partial<Delivery>>;
  public delivery$: Observable<Delivery>;

  constructor(
    private query: DeliveryQuery,
    private service: DeliveryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.deliveryInformations$ = this.query.selectActive().pipe(
      tap(delivery => {
        this.informationsFormGroup.patchValue(delivery);
      }),
      switchMap(delivery => this.informationsFormGroup.valueChanges.pipe(startWith(delivery)))
    );

    this.delivery$ = this.query.selectActive();
  }

  public openSidenav(name: string) {
    this.editContent = name;
    this.opened = true;
  }

  public async updateInformations() {
    try {
      if (this.informationsFormGroup.invalid) {
        throw new Error('Delivery informations are not valid');
      }
      await this.service.updateInformations(this.informationsFormGroup.value);
      this.snackBar.open('Informations updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
