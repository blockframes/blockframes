import { Component, ChangeDetectionStrategy, Input, Directive, ElementRef, ViewChild } from '@angular/core';
import { OverlayWidgetComponent } from '../overlay-widget/overlay-widget.component';

export interface SearchResult {
  title: string;
  icon: string;
  items: string[];
}

@Component({
  selector: 'search-widget',
  templateUrl: './search-widget.component.html',
  styleUrls: ['./search-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchWidgetComponent {

  @Input() link = 'search';
  @Input() results: SearchResult[] = [];
  @ViewChild(OverlayWidgetComponent, { static: false }) searchWidget: OverlayWidgetComponent;

  constructor() { }

  open(ref: ElementRef) {
    if (this.results.length) {
      this.searchWidget.open(ref);
    }
  }

}

@Directive({
  selector: '[searchResult]'
})
export class SearchResultDirective {}