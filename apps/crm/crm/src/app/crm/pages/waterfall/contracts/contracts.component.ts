import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Term, WaterfallContract, getDeclaredAmount } from '@blockframes/model';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsComponent {
  public contracts$ = this.shell.contractsAndTerms$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallDocumentService: WaterfallDocumentsService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  public goTo(id: string) {
    this.router.navigate(['..', 'documents', id], { relativeTo: this.route });
  }

  public getDeclaredAmount(contract: WaterfallContract & { terms: Term[] }) {
    return getDeclaredAmount(contract);
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.shell.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public async removeDocuments(documents: WaterfallContract[]) {
    const promises = documents.map(document => this.waterfallDocumentService.remove(document.id, { params: { waterfallId: document.titleId } }));
    await Promise.all(promises);
    this.snackBar.open(`Document${documents.length > 1 ? 's' : ''} ${documents.length === 1 ? documents[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}