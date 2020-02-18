import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { MovieVersionInfoForm } from '../../version-info/version-info.form';

@Component({
  selector: '[salesInfo] [versionInfo] movie-summary-technical-information',
  templateUrl: './technical-information.component.html',
  styleUrls: ['./technical-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryTechnicalInformationComponent implements OnInit {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() versionInfo: MovieVersionInfoForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.salesInfo.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.versionInfo.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  get hasKeys() {
    return Object.keys(this.versionInfo.controls).length;
  }
}
