import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WaterfallDocument } from '@blockframes/model';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

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
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public async removeDocuments(documents: WaterfallDocument[]) {
    const promises = documents.map(document => this.waterfallDocumentService.remove(document.id, { params: { waterfallId: document.waterfallId } }));
    await Promise.all(promises);
    this.snackBar.open(`Document${documents.length > 1 ? 's' : ''} ${documents.length === 1 ? documents[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }
}