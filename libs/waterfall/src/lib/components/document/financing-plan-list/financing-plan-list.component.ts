import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { WaterfallFinancingPlanForm } from '../../../form/financing-plan.form';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { Organization, WaterfallDocument, WaterfallFinancingPlan, WaterfallPermissions, createWaterfallDocument, createWaterfallFinancingPlan } from '@blockframes/model';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallDocumentsService } from '../../../documents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';
import { BehaviorSubject, Observable, map, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DocumentShareComponent } from '../document-share/document-share.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';


@Component({
  selector: 'waterfall-financing-plan-list',
  templateUrl: './financing-plan-list.component.html',
  styleUrls: ['./financing-plan-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingPlanListComponent implements OnInit {

  @Input() form: WaterfallFinancingPlanForm;
  public disabled = true;
  public loading$ = new BehaviorSubject(false);

  private permissions$: Observable<WaterfallPermissions[]> = this.shell.canBypassRules$.pipe(
    switchMap(canBypassRules => canBypassRules ? this.shell.permissions$ : of([])),
  );

  public organizations$ = this.permissions$.pipe(
    switchMap(permissions => this.orgService.valueChanges(permissions.map(p => p.id))),
    map(orgs => orgs.filter(o => o.id !== this.orgService.org.id))
  );

  constructor(
    private snackBar: MatSnackBar,
    public shell: DashboardWaterfallShellComponent,
    private documentService: WaterfallDocumentsService,
    private uploaderService: FileUploaderService,
    private orgService: OrganizationService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.form.reset({ id: this.documentService.createId() });
  }

  async save(documents: WaterfallDocument[]) {
    this.loading$.next(true);
    const waterfallId = this.shell.waterfall.id;
    const existingDoc = documents.find(d => d.id === this.form.controls.id.value);
    const document = createWaterfallDocument<WaterfallFinancingPlan>({
      id: this.form.controls.id.value,
      type: 'financingPlan',
      waterfallId,
      ownerId: existingDoc?.ownerId || this.orgService.org.id,
      meta: createWaterfallFinancingPlan({})
    });

    await this.documentService.upsert<WaterfallDocument>(document, { params: { waterfallId } });
    this.uploaderService.upload();
    this.uploaderService.clearQueue();
    this.disabled = true;
    this.snackBar.open('Document saved', 'close', { duration: 3000 });

    this.form = new WaterfallFinancingPlanForm({ id: this.documentService.createId() });

    this.loading$.next(false);
  }

  public addedFile($event: boolean) {
    this.disabled = !$event;
  }

  async delete(documentId: string) {
    await this.documentService.remove(documentId, { params: { waterfallId: this.shell.waterfall.id } });
    this.snackBar.open('Document deleted', 'close', { duration: 3000 });
  }

  share(documentId: string, waterfallId: string, organizations: Organization[]) {
    this.dialog.open(DocumentShareComponent, {
      data: createModalData({ organizations, documentId, waterfallId }, 'medium'),
      autoFocus: false
    });
  }

}

