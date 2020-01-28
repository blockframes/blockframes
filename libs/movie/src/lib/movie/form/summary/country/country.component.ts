import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { TerritoriesSlug } from '@blockframes/utils/static-model/types';

@Component({
  selector: '[salesInfo] [originCountries] movie-summary-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCountryComponent implements OnInit {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() originCountries: FormList<TerritoriesSlug>;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.salesInfo.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.originCountries.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
