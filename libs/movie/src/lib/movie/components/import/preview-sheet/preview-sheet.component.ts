import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SheetTab } from '@blockframes/utils';

@Component({
  selector: 'movie-import-preview-sheet',
  templateUrl: './preview-sheet.component.html',
  styleUrls: ['./preview-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewSheetComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<PreviewSheetComponent>,
    @Inject(MAT_DIALOG_DATA) public tabs: SheetTab[],
  ) { }

  ngOnInit() {}


  public cancel() {
    this.dialogRef.close();
  }

}
