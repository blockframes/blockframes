import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Directive,
  ElementRef,
  ViewChild
} from '@angular/core';
import { OverlayWidgetComponent } from '../overlay-widget/overlay-widget.component';

export interface SearchResult {
  title: string;
  icon: string;
  items: Record<string, string>[];
}

@Component({
  selector: 'search-widget',
  templateUrl: './search-widget.component.html',
  styleUrls: ['./search-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchWidgetComponent {
  @Input() searchCtrl: FormControl;
  @Input() link = 'search';
  @Input() results: SearchResult[] = [];
  @ViewChild(OverlayWidgetComponent, { static: false }) searchWidget: OverlayWidgetComponent;

  constructor(private acitvatedRoute: ActivatedRoute, private router: Router) { }

  open(ref: ElementRef) {
    if (this.results.length) {
      this.searchWidget.open(ref);
    }
  }

  public setParams() {
    // TODO #1830 we might ran out of space for all of the search ids
    let ids: string[];
    for (const result of this.results) {
      ids = result.items.map(item => item.id).flat(1);
    }
    this.router.navigate([this.link], {
      relativeTo: this.acitvatedRoute,
      queryParams: {
        ids: ids,
        searchTerm: this.searchCtrl.value
      },
      queryParamsHandling: 'merge'
    });
    this.searchWidget.close();
  }
}

@Directive({
  selector: '[searchResult]'
})
export class SearchResultDirective { }
