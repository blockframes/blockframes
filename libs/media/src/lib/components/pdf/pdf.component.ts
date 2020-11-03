import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { MeetingPdfControl } from '@blockframes/event/+state/event.firestore';
import { MediaService } from '@blockframes/media/+state';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: '[ref] media-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfComponent implements OnInit {

  @Input() ref: string;

  control: MeetingPdfControl;
  loading$ = new BehaviorSubject(true);
  previousDisable$ = new BehaviorSubject(true);
  nextDisable$ = new BehaviorSubject(false);

  constructor(
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {

    // locally download the pdf file to count it's number of pages
    const url = await this.mediaService.generateImgIxUrl(this.ref);
    const response = await fetch(url);
    const textResult = await response.text();
    // this actually count the number of pages, the regex comes from stack overflow
    const totalPages = textResult.match(/\/Type[\s]*\/Page[^s]/g).length;

    this.control = { type: 'pdf', currentPage: 1, totalPages };
    this.loading$.next(false);
  }

  previous() {

    const newControl = {...this.control};

    if (newControl.currentPage === 1) return;

    newControl.currentPage = newControl.currentPage - 1;

    this.nextDisable$.next(false);
    if (newControl.currentPage === 1) this.previousDisable$.next(true);

    this.control = newControl;
    this.cdr.markForCheck();
  }

  next() {

    const newControl = {...this.control};

    if (newControl.currentPage === newControl.totalPages) return;

    newControl.currentPage = newControl.currentPage + 1;

    this.previousDisable$.next(false);
    if (newControl.currentPage === newControl.totalPages) this.nextDisable$.next(true);

    this.control = newControl;
    this.cdr.markForCheck();
  }
}
