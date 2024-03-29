import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Pipe,
  PipeTransform,
  HostBinding,
} from '@angular/core';
import { Movie, ScreeningEvent, MeetingEvent, SlateEvent } from '@blockframes/model';

@Component({
  selector: 'event-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() event: ScreeningEvent | MeetingEvent | SlateEvent;
  @Input() size: 'small' | 'large';

  @HostBinding('class')
  get class() {
    return `event-card ${this.event.type} ${this.size}`;
  }
}

@Pipe({ name: 'screeningBackground', pure: true })
export class ScreeningBackgroundPipe implements PipeTransform {
  transform(movie: Movie, size: 'small' | 'large') {
    if (!movie) {
      return;
    }
    if (size === 'large') {
      return movie.poster;
    } else if (size === 'small') {
      return movie.banner;
    }
  }
}
