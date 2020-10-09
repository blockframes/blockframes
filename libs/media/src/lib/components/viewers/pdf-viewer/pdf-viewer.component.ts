import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MeetingPdfControl } from '@blockframes/event/+state/event.firestore';
import { MediaService } from '@blockframes/media/+state/media.service';
import { ImageParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: '[ref] [control] event-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerComponent {

  private _ref: string;
  get ref() { return this._ref; }
  @Input() set ref(value: string) {
    this._ref = value;
    this.generatePdfUrl();
  }

  private _control: MeetingPdfControl;
  get control() { return this._control; }
  @Input() set control(value: MeetingPdfControl) {
    this._control = value;
    this.generatePdfUrl();
  }

  pdfUrl$ = new BehaviorSubject('');
  loading$ = new BehaviorSubject(true);

  constructor(
    private mediaService: MediaService,
  ) { }

  async generatePdfUrl() {
    if (!this.ref || !this.control || this.control.type !== 'pdf') {
      this.pdfUrl$.next('');
      this.loading$.next(true);
    } else {
      const param: ImageParameters = {
        page: this.control.currentPage,
        auto: 'compress,format'
      }
      const url = await this.mediaService.generateImgIxUrl(this.ref, param);
      this.pdfUrl$.next(url);
      this.loading$.next(false);
    }
  }
}
