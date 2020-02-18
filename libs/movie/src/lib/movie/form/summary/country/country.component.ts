import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { MovieMainForm } from '../../main/main.form';

@Component({
  selector: '[salesInfo] [main] movie-summary-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCountryComponent implements OnInit {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() main: MovieMainForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.salesInfo.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.main.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
