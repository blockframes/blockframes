import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: 'avatar-list',
  templateUrl: './avatar-list.component.html',
  styleUrls: ['./avatar-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarListComponent {

  @Input() urls: string[];
}
