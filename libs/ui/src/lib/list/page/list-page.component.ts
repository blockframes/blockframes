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

@Directive({ selector: '[pageTitle]' })
export class PageTitleDirective { }

@Directive({ selector: '[pageResultDescription]' })
export class PageResultDescriptionDirective { }

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

@Directive({ selector: '[pageError]' })
export class PageErrorDirective { }

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
  @ContentChild(PageResultDescriptionDirective, { read: TemplateRef }) pageResultDescriptionTemplate: PageResultDescriptionDirective
  @ContentChild(PageErrorDirective, { read: TemplateRef }) pageErrorTemplate: PageErrorDirective;

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