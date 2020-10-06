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

@Directive({ selector: 'page-title' })
export class PageTitleDirective { }

@Directive({ selector: 'page-description' })
export class PageDescriptionTemplateDirective { }

@Directive({ selector: 'page-sort' })
export class PageSortDirective { }

@Directive({ selector: 'page-search' })
export class PageSearchDirective { }

@Directive({ selector: '[pageCard]' })
export class PageCardDirective { }

@Directive({ selector: '[pageListItem]' })
export class PageListItemDirective { }

@Directive({ selector: 'page-progress' })
export class PageProgressDirective { }

@Directive({ selector: 'page-empty' })
export class PageEmptyDirective { }

@Component({
  selector: '[items]list-page',
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
  @ContentChild(PageTitleDirective, { read: TemplateRef }) pageTitleTemplate: PageTitleDirective;
  @ContentChild(PageDescriptionTemplateDirective, { read: TemplateRef }) pageDescriptionTemplate: PageDescriptionTemplateDirective
  @ContentChild(PageEmptyDirective, { read: TemplateRef }) pageErrorTemplate: PageEmptyDirective;

  @Input() items: unknown[];

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