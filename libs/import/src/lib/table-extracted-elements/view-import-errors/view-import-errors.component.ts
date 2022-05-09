import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { scrollIntoView } from '@blockframes/utils/browser/utils';
import { SpreadsheetImportError } from '../../utils';

@Component({
  selector: 'import-view-import-errors',
  templateUrl: './view-import-errors.component.html',
  styleUrls: ['./view-import-errors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewImportErrorsComponent {
  constructor(
    private dialog: MatDialogRef<ViewImportErrorsComponent>,
    @Inject(MAT_DIALOG_DATA) public element: { title: string, errors: SpreadsheetImportError[] },
  ) { }

  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep(index?: number) {
    this.step++;
    if (index === this.element.errors.length) {
      this.dialog.close();
    } else {
      const next = document.querySelector(`[data-scroll-to-view-id="${this.step}"]`);
      scrollIntoView(next)
    }
  }

  prevStep() {
    this.step--;
    const previous = document.querySelector(`[data-scroll-to-view-id="${this.step}"]`);
    scrollIntoView(previous)
  }
}
