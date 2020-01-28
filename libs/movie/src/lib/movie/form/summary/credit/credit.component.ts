import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieMainForm } from '../../main/main.form';
import { MovieSalesCastForm } from '../../sales-cast/sales-cast.form';

@Component({
  selector: '[salesCast] [main] movie-summary-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCreditComponent implements OnInit {
  @Input() main: MovieMainForm;
  @Input() salesCast: MovieSalesCastForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.main.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.salesCast.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
