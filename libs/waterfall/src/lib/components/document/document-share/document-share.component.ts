import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organization, WaterfallDocument } from '@blockframes/model';
import { WaterfallDocumentsService } from '../../../documents.service';

interface DocumentShareData {
  documentId: string;
  waterfallId: string;
  organizations: Organization[];
}

@Component({
  selector: 'waterfall-document-share',
  templateUrl: './document-share.component.html',
  styleUrls: ['./document-share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentShareComponent implements OnInit {

  public control = new FormControl<string[]>([]);
  private document: WaterfallDocument;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: DocumentShareData,
    public dialogRef: MatDialogRef<DocumentShareComponent>,
    private documentService: WaterfallDocumentsService,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    this.document = await this.documentService.getValue(this.data.documentId, { waterfallId: this.data.waterfallId });
    this.control.setValue(this.document.sharedWith || []);
  }

  public async confirm() {
    if (!this.control.valid) return;
    const waterfallId = this.data.waterfallId;
    this.document.sharedWith = this.control.value;

    await this.documentService.update<WaterfallDocument>(this.document, { params: { waterfallId } });
    this.snackBar.open($localize`Document shared`, 'close', { duration: 3000 });
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
