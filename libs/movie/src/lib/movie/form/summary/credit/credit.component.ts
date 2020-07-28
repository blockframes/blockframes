import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieSalesCastForm, CreditForm } from '../../sales-cast/sales-cast.form';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[salesCast] [main] [production] movie-summary-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCreditComponent implements OnInit {
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public producerHasNoValue(producer: CreditForm) {
    return !producer.get('firstName').value || !producer.get('lastName').value || !producer.get('role').value;
  }
}
