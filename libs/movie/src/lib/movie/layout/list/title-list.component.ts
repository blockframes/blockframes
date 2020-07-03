import { Component, ChangeDetectionStrategy, Directive, ContentChild, TemplateRef, Input, AfterContentInit } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';


@Directive({selector: '[appBarTitleSort]'})
export class AppBarTitleSortDirective {}

@Directive({selector: '[appBarTitleSearch]'})
export class AppBarTitleSearchDirective {}

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
export class TitleListComponent implements AfterContentInit {

  @ContentChild(AppBarTitleSortDirective, { read: TemplateRef }) appBarTitleSortTemplate: AppBarTitleSortDirective;
  @ContentChild(AppBarTitleSearchDirective, { read: TemplateRef }) appBarTitleSearchTemplate: AppBarTitleSearchDirective;
  @ContentChild(TitleSortDirective, { read: TemplateRef }) titleSortTemplate: TitleSortDirective;
  @ContentChild(TitleSearchDirective, { read: TemplateRef }) titleSearchTemplate: TitleSearchDirective;
  @ContentChild(TitleCardDirective, { read: TemplateRef }) titleCardTemplate: TitleCardDirective;
  @ContentChild(TitleListItemDirective, { read: TemplateRef }) titleListItemTemplate: TitleListItemDirective;

  @Input() titles: Movie[];

  @Input() titleType = 'title'; // only for display purpose

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
