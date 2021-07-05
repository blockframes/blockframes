// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';


@Component({
  selector: 'tag-component',
  templateUrl: 'tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent {
  @Input() label: string;
}
