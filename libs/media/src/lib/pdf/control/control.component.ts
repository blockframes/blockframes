
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MeetingPdfControl } from '@blockframes/event/+state/event.firestore';


@Component({
  selector: '[control] pdf-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfControlComponent {

  control$ = new BehaviorSubject<MeetingPdfControl>(undefined);
  @Input() set control(value: MeetingPdfControl) {
    this.control$.next(value);
  }

  @Output() controlChange = new EventEmitter<MeetingPdfControl>();

  previousDisable$ = new BehaviorSubject(true);
  nextDisable$ = new BehaviorSubject(false);

  previous() {
    const control = this.control$.getValue();

    if (control.currentPage === 1) return;

    control.currentPage = control.currentPage - 1;

    this.nextDisable$.next(false);
    if (control.currentPage === 1) this.previousDisable$.next(true);

    this.control$.next(control);
    this.controlChange.emit(control);
  }

  next() {
    const control = this.control$.getValue();

    if (control.currentPage === control.totalPages) return;

    control.currentPage = control.currentPage + 1;

    this.previousDisable$.next(false);
    if (control.currentPage === control.totalPages) this.nextDisable$.next(true);

    this.control$.next(control);
    this.controlChange.emit(control);
  }
}
