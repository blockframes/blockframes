import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { HostedMediaForm } from '@blockframes/media/form/media.form';

@Component({
  selector: '[form] admin-image-sizes',
  templateUrl: './image-sizes.component.html',
  styleUrls: ['./image-sizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageSizeComponent {
  @Input() form: HostedMediaForm;
}
