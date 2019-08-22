import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { MGDeadline, Delivery } from '../../+state';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'delivery-informations-deadlines-repertory',
  templateUrl: './delivery-informations-deadlines-repertory.component.html',
  styleUrls: ['./delivery-informations-deadlines-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDeadlinesRepertoryComponent {
  @Input()
  set delivery(delivery: Delivery) {
    const deadlines = delivery.mgDeadlines.map(deadline => ({
      ...deadline,
      amount: (delivery.mgAmount && deadline.percentage) ? (delivery.mgAmount * deadline.percentage / 100) : null
    }));
    this.dataSource = new MatTableDataSource(deadlines);
    this.mgCurrency = delivery.mgCurrency;
  }

  @Output() editing = new EventEmitter();

  public mgCurrency: string;
  public dataSource: MatTableDataSource<MGDeadline>;
  public displayedColumns: string[] = ['label', 'percentage', 'amount', 'date'];
}
