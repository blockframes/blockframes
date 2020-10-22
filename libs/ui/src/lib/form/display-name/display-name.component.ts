import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[form] form-display-name',
  templateUrl: './display-name.component.html',
  styleUrls: ['./display-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayNameComponent {
  @Input() form: FormGroup;
  @Input() labelSuffix: string;
  @Input() @boolean required = false;
}
