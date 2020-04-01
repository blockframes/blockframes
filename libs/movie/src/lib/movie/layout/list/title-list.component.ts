import { Component, ChangeDetectionStrategy, Directive, ContentChild, TemplateRef, Input, AfterContentInit } from '@angular/core';

import { Observable } from 'rxjs';


@Directive({selector: '[titleSort]'})
export class TitleSortDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Directive({selector: '[titleSearch]'})
export class TitleSearchDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Directive({selector: '[titleCard]'})
export class TitleCardDirective {
  constructor(public template: TemplateRef<any>) {}
}
@Directive({selector: '[titleListItem]'})
export class TitleListItemDirective {
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: '[titles$] title-list',
  templateUrl: './title-list.component.html',
  styleUrls: ['./title-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent implements AfterContentInit {

  @ContentChild(TitleSortDirective) titleSortTemplate: TitleSortDirective;
  @ContentChild(TitleSearchDirective) titleSearchTemplate: TitleSearchDirective;
  @ContentChild(TitleCardDirective) titleCardTemplate: TitleCardDirective;
  @ContentChild(TitleListItemDirective) titleListItemTemplate: TitleListItemDirective;

  @Input() titles$: Observable<any>;

  @Input() titleType = 'movie'; // only for display purpose

  public listView = false;
  public canToggle = false;

  ngAfterContentInit() {
    if (!!this.titleCardTemplate && !!this.titleListItemTemplate) {
      this.canToggle = true;
    } else if (!!this.titleListItemTemplate) {
      this.listView = true;
    }
  }
}
