import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[form] form-display-name',
  templateUrl: './display-name.component.html',
  styleUrls: ['./display-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayNameComponent {
  @Input() form: UntypedFormGroup;
  @Input() labelSuffix: string;
  @Input() @boolean required = false;
}
