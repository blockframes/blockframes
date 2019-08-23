import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { MGDeadline, Delivery } from '../../+state';
import { MatTableDataSource } from '@angular/material/table';
import { calculAmount } from '../delivery-informations-deadlines-form/delivery-informations-deadlines-form.component';

@Component({
  selector: 'delivery-informations-deadlines-repertory',
  templateUrl: './delivery-informations-deadlines-repertory.component.html',
  styleUrls: ['./delivery-informations-deadlines-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDeadlinesRepertoryComponent {
  @Input()
  set delivery(delivery: Delivery) {
    // Calcul deadline amount for each deadline
    const deadlines = delivery.mgDeadlines.map(deadline => ({
      ...deadline,
      amount: (delivery.mgAmount && deadline.percentage) ? calculAmount(delivery.mgAmount, deadline.percentage) : null
    }));
    this.dataSource = new MatTableDataSource(deadlines);
    this.mgCurrency = delivery.mgCurrency;
    this.mgAmount = delivery.mgAmount;
  }

  @Output() editing = new EventEmitter();

  public mgAmount: number;
  public mgCurrency: string;
  public dataSource: MatTableDataSource<MGDeadline>;
  public displayedColumns: string[] = ['label', 'percentage', 'amount', 'date'];
}
