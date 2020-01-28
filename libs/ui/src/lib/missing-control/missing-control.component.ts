import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[control] [link] missing-control',
  templateUrl: './missing-control.component.html',
  styleUrls: ['./missing-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissingControlComponent {
  @Input() control: FormControl;
  @Input() label: string;
  @Input() link: string;
}
