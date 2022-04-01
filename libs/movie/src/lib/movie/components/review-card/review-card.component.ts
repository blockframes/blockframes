import { Component, Input, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MovieReview } from '@blockframes/shared/model';

@Component({
  selector: 'title-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardComponent {
  @Input() review: MovieReview;
  @ViewChild('dialogRef') dialogRef: TemplateRef<any>;

  constructor(private dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(this.dialogRef, { maxWidth: '60vw', maxHeight: '60vh' });
  }
}
