// Angular
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ContentChild,
  Input,
  AfterContentInit, Output, EventEmitter
} from '@angular/core';

// Blockframes
import { fadeList } from '@blockframes/utils/animations/fade';

@Directive({ selector: '[pageSort]' })
export class PageSortDirective { }

@Directive({ selector: '[pageSearch]' })
export class PageSearchDirective { }

@Directive({ selector: '[pageCard]' })
export class PageCardDirective { }

@Directive({ selector: '[pageListItem]' })
export class PageListItemDirective { }

@Directive({ selector: '[pageProgress]' })
export class PageProgressDirective { }

@Component({
  selector: '[items][itemType]list-page',
  templateUrl: 'list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  animations: [fadeList('.card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPageComponent implements AfterContentInit {

  @ContentChild(PageSortDirective, { read: TemplateRef }) pageSortTemplate: PageSortDirective;
  @ContentChild(PageSearchDirective, { read: TemplateRef }) pageSearchTemplate: PageSearchDirective;
  @ContentChild(PageCardDirective, { read: TemplateRef }) pageCardTemplate: PageCardDirective;
  @ContentChild(PageListItemDirective, { read: TemplateRef }) pageListItemTemplate: PageListItemDirective;
  @ContentChild(PageProgressDirective, { read: TemplateRef }) pageProgressTemplate: PageProgressDirective;

  @Input() items: any[];

  @Input() titleText: string;

  @Input() itemType = 'title'; // only for display purpose

  @Input() hitsViewed: number;

  @Input() nbHits: number

  @Output() loadMore = new EventEmitter()

  public listView = false;
  public canToggle = false;

  constructor(private location: Location) { }

  ngAfterContentInit() {
    if (!!this.pageCardTemplate && !!this.pageListItemTemplate) {
      this.canToggle = true;
    } else if (!!this.pageListItemTemplate) {
      this.listView = true;
    }
  }

  trackById(entity: Record<string, any>) {
    return entity.id;
  }

  goBack() {
    this.location.back();
  }
}