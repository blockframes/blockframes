// Angular
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: '[progressValue]bf-load-more-button',
  templateUrl: 'load-more-button.component.html',
  styleUrls: ['./load-more-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadMoreButtonComponent {
  @Input() progressValue: number

  @Output() buttonClicked = new EventEmitter;
}