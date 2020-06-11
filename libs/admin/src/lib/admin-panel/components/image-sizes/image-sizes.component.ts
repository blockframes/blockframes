import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ImgRef } from '@blockframes/utils/media/media.model';

@Component({
  selector: '[imgRef] admin-image-sizes',
  templateUrl: './image-sizes.component.html',
  styleUrls: ['./image-sizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageSizeComponent  {
  @Input() imgRef: ImgRef;
  @Input() title = 'Image sizes';
}
