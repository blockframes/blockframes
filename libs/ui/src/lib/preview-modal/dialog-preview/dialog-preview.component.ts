import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private mediaService: MediaService
  ) { }

  ngOnInit() {
    if(this.data.ref?.changingThisBreaksApplicationSecurity?.includes('blob')) {
      this.src = this.data.ref
    } else {
      this.mediaService.generateImgIxUrl(this.data.ref, this.parameters).then(src => this.src = src)
    }
  }
}