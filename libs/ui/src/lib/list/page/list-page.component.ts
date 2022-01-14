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
import { boolean } from '@blockframes/utils/decorators/decorators';

@Directive({ selector: '[listPageAppBar], list-page-app-bar' })
export class PageAppBarSearchDirective { }

@Directive({ selector: '[listPageTitle], list-page-title' })
export class PageTitleDirective { }

@Directive({ selector: '[listPageDescription], list-page-description' })
export class PageDescriptionTemplateDirective { }

@Directive({ selector: '[listPageSearch], list-page-search' })
export class PageSearchDirective { }

@Directive({ selector: '[listPageCard]' })
export class PageCardDirective { }

@Directive({ selector: '[listPageListItem]' })
export class PageListItemDirective { }

@Directive({ selector: '[listPageEmpty]' })
export class PageEmptyDirective { }

@Directive({ selector: '[pdfExport], pdf-export' })
export class PdfExportDirective { }

@Directive({ selector: '[eventsExport], events-export' })
export class EventsExportDirective { }

@Component({
  selector: '[items] list-page',
  templateUrl: 'list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  animations: [fadeList('.card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPageComponent implements AfterContentInit {

  @ContentChild(PageCardDirective, { read: TemplateRef }) cardTemplate: PageCardDirective;
  @ContentChild(PageListItemDirective, { read: TemplateRef }) listItemTemplate: PageListItemDirective;
  @ContentChild(PageEmptyDirective, { read: TemplateRef }) listPageEmptyTemplate: PageEmptyDirective;
  @ContentChild(PageAppBarSearchDirective) appBar: PageAppBarSearchDirective;

  @Input() items: unknown[];
  @Input() @boolean exportButton = false;

  public listView = false;
  public canToggle = false;

  constructor(private location: Location) { }

  ngAfterContentInit() {
    if (this.cardTemplate && this.listItemTemplate) {
      this.canToggle = true;
    } else if (this.listItemTemplate) {
      this.listView = true;
    }
  }

  trackById(entity: { id: string }) {
    return entity.id;
  }

  goBack() {
    this.location.back();
  }
}

@Component({
  selector: 'list-page-progress',
  template: `
    <ng-container *ngIf="value && value !== 100">
      <ng-content></ng-content>
      <mat-progress-bar color="primary" [value]="value"></mat-progress-bar>
      <button mat-stroked-button color="primary" (click)="loadMore.emit()">
        Load More
      </button>
    </ng-container>
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
