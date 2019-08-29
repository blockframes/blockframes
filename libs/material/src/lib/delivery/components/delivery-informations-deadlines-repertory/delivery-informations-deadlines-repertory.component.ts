import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { MGDeadline, Delivery } from '../../+state';
import { MatTableDataSource } from '@angular/material/table';
import { calculAmount } from '../delivery-informations-deadlines-form/delivery-informations-deadlines-form.component';

function deliveryAmount(delivery: Partial<Delivery>, deadline: MGDeadline) {
  return delivery.mgAmount && deadline.percentage
    ? calculAmount(delivery.mgAmount, deadline.percentage)
    : null;
}

@Component({
  selector: 'delivery-informations-deadlines-repertory',
  templateUrl: './delivery-informations-deadlines-repertory.component.html',
  styleUrls: ['./delivery-informations-deadlines-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDeadlinesRepertoryComponent {
  @Input()
  set deliveryInformations(delivery: Partial<Delivery>) {
    // Calcul deadline amount for each deadline
    const deadlines = delivery.mgDeadlines.map(deadline => ({
      ...deadline,
      amount: deliveryAmount(delivery, deadline)
    }));
    this.dataSource = new MatTableDataSource(deadlines);
    this.mgCurrency = delivery.mgCurrency;
    this.mgAmount = delivery.mgAmount;
  }
  @Input() isSigned: boolean;

  @Output() editing = new EventEmitter();

  public mgAmount: number;
  public mgCurrency: string;
  public dataSource: MatTableDataSource<MGDeadline>;
  public displayedColumns: string[] = ['label', 'percentage', 'amount', 'date'];
}
