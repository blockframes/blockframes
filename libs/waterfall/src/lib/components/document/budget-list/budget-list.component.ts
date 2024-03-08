import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { WaterfallBudgetForm } from '../../../form/budget.form';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { WaterfallBudget, WaterfallDocument, createWaterfallBudget, createWaterfallDocument } from '@blockframes/model';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallDocumentsService } from '../../../documents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'waterfall-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetListComponent implements OnInit {

  @Input() form: WaterfallBudgetForm;
  public disabled = true;
  public loading$ = new BehaviorSubject(false);

  constructor(
    private snackBar: MatSnackBar,
    public shell: DashboardWaterfallShellComponent,
    private documentService: WaterfallDocumentsService,
    private uploaderService: FileUploaderService,
    private orgService: OrganizationService,
  ) { }

  ngOnInit() {
    this.form.reset({ id: this.documentService.createId() });
  }

  async save(documents: WaterfallDocument[]) {
    this.loading$.next(true);
    const waterfallId = this.shell.waterfall.id;
    const existingDoc = documents.find(d => d.id === this.form.controls.id.value);
    const document = createWaterfallDocument<WaterfallBudget>({
      id: this.form.controls.id.value,
      type: 'budget',
      waterfallId,
      ownerId: existingDoc?.ownerId || this.orgService.org.id,
      meta: createWaterfallBudget({})
    });

    await this.documentService.upsert<WaterfallDocument>(document, { params: { waterfallId } });
    this.uploaderService.upload();
    this.uploaderService.clearQueue();
    this.disabled = true;
    this.snackBar.open('Document saved', 'close', { duration: 3000 });

    this.form = new WaterfallBudgetForm({ id: this.documentService.createId() });

    this.loading$.next(false);
  }

  public addedFile($event: boolean) {
    this.disabled = !$event;
  }

  async delete(documentId: string) {
    await this.documentService.remove(documentId, { params: { waterfallId: this.shell.waterfall.id } });
    this.snackBar.open('Document deleted', 'close', { duration: 3000 });
  }

}

