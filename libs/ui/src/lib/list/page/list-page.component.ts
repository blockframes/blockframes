// Angular
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ContentChild,
  Input,
  AfterContentInit
} from '@angular/core';

// Blockframes
import { fadeList } from '@blockframes/utils/animations/fade';

@Directive({ selector: '[pageSort]' })
export class PageSortDirective { }

@Directive({ selector: '[pageSearch]' })
export class PageSearchDirective { }

@Directive({ selector: '[PageCard]' })
export class PageCardDirective { }

@Directive({ selector: '[PageListItem]' })
export class PageListItemDirective { }

@Directive({ selector: '[PageProgress]' })
export class PageProgressDirective { }

@Component({
  selector: '[items]list-page',
  templateUrl: 'list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  animations: [fadeList('.card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPageComponent implements AfterContentInit {

  @ContentChild(PageSortDirective, { read: TemplateRef }) pageSortTemplate: PageSortDirective;
  @ContentChild(PageSortDirective, { read: TemplateRef }) pageSearchTemplate: PageSortDirective;
  @ContentChild(PageCardDirective, { read: TemplateRef }) pageCardTemplate: PageCardDirective;
  @ContentChild(PageListItemDirective, { read: TemplateRef }) pageListItemTemplate: PageListItemDirective;
  @ContentChild(PageProgressDirective, { read: TemplateRef }) pageProgressTemplate: PageProgressDirective;

  @Input() items: any[];

  @Input() titleText: string;

  @Input() itemType = 'title'; // only for display purpose

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