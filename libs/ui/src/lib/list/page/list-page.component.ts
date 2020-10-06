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

@Directive({ selector: 'list-page-title' })
export class PageTitleDirective { }

@Directive({ selector: 'list-page-description' })
export class PageDescriptionTemplateDirective { }

@Directive({ selector: 'list-page-sort' })
export class PageSortDirective { }

@Directive({ selector: 'list-page-search' })
export class PageSearchDirective { }

@Directive({ selector: '[listPageCard]' })
export class PageCardDirective { }

@Directive({ selector: '[listPageListItem]' })
export class PageListItemDirective { }

@Directive({ selector: 'list-page-progress' })
export class PageProgressDirective { }

@Directive({ selector: '[listPageEmpty]' })
export class PageEmptyDirective { }

@Component({
  selector: '[items]list-page',
  templateUrl: 'list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  animations: [fadeList('.card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPageComponent implements AfterContentInit {

  @ContentChild(PageCardDirective, { read: TemplateRef }) cardTemplate: PageCardDirective;
  @ContentChild(PageListItemDirective, { read: TemplateRef }) listItemTemplate: PageListItemDirective;
  @ContentChild(PageEmptyDirective, { read: TemplateRef }) listPageEmptyTemplate: PageEmptyDirective;

  @Input() items: unknown[];

  public listView = false;
  public canToggle = false;

  constructor(private location: Location) { }

  ngAfterContentInit() {
    if (!!this.cardTemplate && !!this.listItemTemplate) {
      this.canToggle = true;
    } else if (!!this.listItemTemplate) {
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