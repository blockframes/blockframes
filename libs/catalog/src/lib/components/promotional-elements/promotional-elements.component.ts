import { PromotionalElement, MoviePromotionalElements } from '@blockframes/movie/types';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'catalog-promotional-elements',
  templateUrl: './promotional-elements.component.html',
  styleUrls: ['./promotional-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogPromotionalElementsComponent implements OnInit {
  @Output() promoReelOpened = new EventEmitter();
  @Input() promotionalElements: MoviePromotionalElements
  public elements: PromotionalElement[];

  ngOnInit() { 
    this.elements = [
      this.promotionalElements.promo_reel_link,
      this.promotionalElements.scenario,
      this.promotionalElements.screener_link,
      ...this.promotionalElements.trailer,
      this.promotionalElements.trailer_link,
      this.promotionalElements.teaser_link
    ]
  }

}

