import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieMainForm } from '../../main/main.form';
import { MovieSalesCastForm, CreditForm } from '../../sales-cast/sales-cast.form';
import { MovieProductionForm } from '../../production.form';

@Component({
  selector: '[salesCast] [main] [production] movie-summary-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCreditComponent implements OnInit {
  @Input() main: MovieMainForm;
  @Input() production: MovieProductionForm;
  @Input() salesCast: MovieSalesCastForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.main.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.salesCast.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public producerHasNoValue(producer: CreditForm) {
    return !producer.get('firstName').value || !producer.get('lastName').value || !producer.get('role').value;
  }
}
