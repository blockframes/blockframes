import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MoviePromotionalElementsForm } from '../../promotional-elements/promotional-elements.form';

@Component({
  selector: '[promotionalElements] movie-summary-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryFileComponent implements OnInit {
  @Input() promotionalElements: MoviePromotionalElementsForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.promotionalElements.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
