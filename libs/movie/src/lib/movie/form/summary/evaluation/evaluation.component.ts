import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';

@Component({
  selector: '[salesInfo] movie-summary-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryEvaluationComponent implements OnInit {
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.salesInfo.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
