// Angular
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ContentChild,
  Input,
  AfterContentInit, Output, EventEmitter, HostBinding
} from '@angular/core';

// Blockframes
import { fadeList, slideUp } from '@blockframes/utils/animations/fade';

@Directive({ selector: 'list-page-app-bar' })
export class PageAppBarSearchDirective { }

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

@Component({
  selector: 'list-page-progress',
  template: `
  <ng-content></ng-content>
  <mat-progress-bar color="primary" [value]="value"></mat-progress-bar>
  <button mat-stroked-button color="primary" (click)="loadMore.emit()" [disabled]="value === 100 || !value">LOAD
    MORE</button>
    `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    mat-progress-bar {
        margin: 16px;
        width: 80%;
      }`],
  animations: [slideUp],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageProgressComponent {
  @Input() value: number

  @Output() loadMore = new EventEmitter();

  @HostBinding('@slideUp') animation = true;;
}