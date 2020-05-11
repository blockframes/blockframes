import { Component, ChangeDetectionStrategy, Directive, ContentChild, TemplateRef, Input, AfterContentInit, OnInit } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';


@Directive({selector: '[titleSort]'})
export class TitleSortDirective {}

@Directive({selector: '[titleSearch]'})
export class TitleSearchDirective {}

@Directive({selector: '[titleCard]'})
export class TitleCardDirective {}
@Directive({selector: '[titleListItem]'})
export class TitleListItemDirective {}

@Component({
  selector: '[titles$] title-list',
  templateUrl: './title-list.component.html',
  styleUrls: ['./title-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleListComponent implements AfterContentInit, OnInit {

  @ContentChild(TitleSortDirective, { read: TemplateRef }) titleSortTemplate: TitleSortDirective;
  @ContentChild(TitleSearchDirective, { read: TemplateRef }) titleSearchTemplate: TitleSearchDirective;
  @ContentChild(TitleCardDirective, { read: TemplateRef }) titleCardTemplate: TitleCardDirective;
  @ContentChild(TitleListItemDirective, { read: TemplateRef }) titleListItemTemplate: TitleListItemDirective;

  @Input() titles$: Observable<any>;

  @Input() titleType = 'title'; // only for display purpose

  public listView = false;
  public canToggle = false;
  public isLoaded = of(false);

  ngOnInit() {
    this.isLoaded = this.titles$.pipe(
      map(titles => titles.lenght !== 0)
    )
  }

  ngAfterContentInit() {
    if (!!this.titleCardTemplate && !!this.titleListItemTemplate) {
      this.canToggle = true;
    } else if (!!this.titleListItemTemplate) {
      this.listView = true;
    }
  }
}
