import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterfallDocument } from '@blockframes/model';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'crm-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent {
  public documents$ = this.shell.documents$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallDocumentService: WaterfallDocumentsService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public removeDocuments(documents: WaterfallDocument[]) {
    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'Are you sure?',
        question: 'If you remove a Document used in Waterfall, it might break.',
        confirm: `Yes, remove Document${documents.length > 1 ? 's' : ''}.`,
        cancel: `No, keep Document${documents.length > 1 ? 's' : ''}.`,
        onConfirm: async () => {
          const promises = documents.map(document => this.waterfallDocumentService.remove(document.id, { params: { waterfallId: document.waterfallId } }));
          await Promise.all(promises);
          this.snackBar.open(`Document${documents.length > 1 ? 's' : ''} ${documents.length === 1 ? documents[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
        }
      }, 'small'),
      autoFocus: false
    });
  }

}