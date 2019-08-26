import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DeliveryQuery, DeliveryService, MGDeadline, DeliveryStatus } from '../../+state';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'delivery-statuses',
  templateUrl: './delivery-statuses.component.html',
  styleUrls: ['./delivery-statuses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryStatusesComponent implements OnInit {
  public mgDeadlines$: Observable<MGDeadline[]>;
  public currentDeadline$: Observable<number>;

  public deliveryStatuses$: Observable<DeliveryStatus[]>;
  public currentStatus$: Observable<number>;

  public constructor(private query: DeliveryQuery, private service: DeliveryService) {
  }

  ngOnInit(): void {
    this.mgDeadlines$ = this.query.mgDeadlines$;
    this.currentDeadline$ = this.query.currentDeadline$;

    this.deliveryStatuses$ = this.query.statuses$;
    this.currentStatus$ = combineLatest([
      this.query.statuses$,
      this.query.currentStatus$
    ]).pipe(
      map(([statuses, currentStatus]) => statuses.indexOf(currentStatus))
    )
  }

  public onMGDeadlinePick(event: StepperSelectionEvent) {
    return this.service.updateCurrentMGDeadline(event.selectedIndex);
  }

  public onDeliveryStatusPick(event: StepperSelectionEvent) {
    return this.service.updateDeliveryStatus(event.selectedIndex);
  }
}
