import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { MoviePromotionalElementsForm } from '../../promotional-elements/promotional-elements.form';
import { Subscription } from 'rxjs';

const fileRefs = {
  presentation_deck: 'Presentation Deck',
}

const fileLinks = {
  promo_reel_link: 'Promo Reel',
  screener_link: 'Screener',
  trailer_link: 'Trailer',
  teaser_link: 'Pitch Teaser'
} as const;

@Component({
  selector: '[promotional] movie-summary-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryFileComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  fileLinks = fileLinks;
  fileRefs = fileRefs;

  @Input() promotional: MoviePromotionalElementsForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = this.promotional.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
