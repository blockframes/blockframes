import { ChangeDetectionStrategy, Component, Directive, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaService } from '@blockframes/media/+state/media.service';
import { ImageParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';

@Component({
  selector: 'bf-dialog-preview',
  templateUrl: 'dialog-preview.component.html',
  styleUrls: ['./dialog-preview.component.scss'],
  /* No need for OnPush change detection since it will be closed if anything else is happening */
  changeDetection: ChangeDetectionStrategy.Default
})
export class DialogPreviewComponent implements OnInit {
  private parameters: ImageParameters = {
    auto: 'compress,format',
    fit: 'crop',
    w: 0,
  };

  public src: string
  public placeholder = 'assets/images/banner_empty.png';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private mediaService: MediaService
  ) { }

  async ngOnInit() {
    // create an XHR object
    const xhr = new XMLHttpRequest();

    if (typeof this.data.ref !== 'string') {
      this.src = this.data.ref
    } else {
      const source = await this.mediaService.generateImgIxUrl(this.data.ref, this.parameters);

      // listen for `onload` event
      xhr.onload = () => {
        if (xhr.status === 200) {
          this.src = source;
        } else {
          this.src = '';
        }
      };
      // create a `HEAD` request
      xhr.open('HEAD', source);
      // send request
      xhr.send();
    }
  }
}
