import { Component, OnInit, ChangeDetectionStrategy, Input, Directive } from '@angular/core';

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
export class SearchWidgetComponent implements OnInit {

  @Input() link = 'search';
  @Input() results: SearchResult[] = [];

  constructor() { }

  ngOnInit() {
  }

  open(widget) {
    console.log('has open', !!widget['open']);
  }

}

@Directive({
  selector: '[searchResult]'
})
export class SearchResultDirective {}