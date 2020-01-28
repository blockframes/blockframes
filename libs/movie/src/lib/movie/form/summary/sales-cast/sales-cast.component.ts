import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MovieSalesCastForm } from '../../sales-cast/sales-cast.form';

@Component({
  selector: '[salesCast] movie-summary-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummarySalesCastComponent implements OnInit {
  @Input() salesCast: MovieSalesCastForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.salesCast.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
