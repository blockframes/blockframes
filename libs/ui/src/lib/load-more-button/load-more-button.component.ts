// Angular
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  Input,
  Output,
  TemplateRef
} from '@angular/core';

@Directive({ selector: '[buttonText]' })
export class LoadMoreButtonTextDirective { }

@Component({
  selector: '[nbHits][hitsViewed]bf-load-more-button',
  templateUrl: 'load-more-button.component.html',
  styleUrls: ['./load-more-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadMoreButtonComponent {
  @Input() nbHits: number
  @Input() hitsViewed: number

  @Output() buttonClicked = new EventEmitter;

  @ContentChild(LoadMoreButtonTextDirective, { read: TemplateRef }) loadMoreButtonTextTemplate: LoadMoreButtonTextDirective;
}