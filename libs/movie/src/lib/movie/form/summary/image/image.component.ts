import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MoviePromotionalElementsForm } from '../../promotional-elements/promotional-elements.form';

@Component({
  selector: '[promotionalElements] movie-summary-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryImageComponent implements OnInit {
  @Input() promotionalElements: MoviePromotionalElementsForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.promotionalElements.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  get bannerHasNoValue() {
    return !this.promotionalElements.get('banner').get('media').value.originalFileName;
  }

  get posterHasNoValue() {
    return !this.promotionalElements.get('poster').controls[0].controls['media'].value.originalFileName;
  }

  get photoHasNoValue() {
    return !this.promotionalElements.get('still_photo').controls[0].controls['media'].value.originalFileName;
  }
}
