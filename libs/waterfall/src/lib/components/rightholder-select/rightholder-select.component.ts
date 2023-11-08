import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WaterfallRightholder } from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[rightholders]waterfall-rightholder-select',
  templateUrl: './rightholder-select.component.html',
  styleUrls: ['./rightholder-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightholderSelectComponent {
  @Input() rightholders: WaterfallRightholder[];
  @Input() value: WaterfallRightholder;
  @Input() control: FormControl<string | string[]>;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() @boolean multiple: boolean;
  @Input() @boolean required: boolean;
  @Input() @boolean disabled: boolean;
}
