import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DeliveryQuery, MGDeadline } from '../../+state';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { BehaviorSubject, Observable, of } from 'rxjs';

const mgValues = [
  { label: 'CM Signature', percent: 10 },
  { label: 'NOA', percent: 60 },
  { label: 'NOD', percent: 30 }
];

interface DeliveryStatus {
  label: string;
}

const statusValues: DeliveryStatus[] = [
  { label: 'In Negociation' },
  { label: 'Material Pending' },
  { label: 'NOA' },
  { label: 'NOD' },
  { label: 'Materials Accepted' }
];

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

  public constructor(private query: DeliveryQuery) {}

  ngOnInit(): void {
    this.mgDeadlines$ = of(mgValues);
    this.currentDeadline$ = new BehaviorSubject(0);

    this.deliveryStatuses$ = of(statusValues);
    this.currentStatus$ = new BehaviorSubject(1);
  }

  public onMGDeadlinePick(event: StepperSelectionEvent) {
    (this.currentDeadline$ as BehaviorSubject<number>).next(event.selectedIndex);
  }

  public onDeliveryStatusPick(event: StepperSelectionEvent) {
    (this.currentStatus$ as BehaviorSubject<number>).next(event.selectedIndex);
  }
}
