import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PricePerCurrency, Right, WaterfallRightholder, mainCurrency } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { Observable, combineLatest, map, pluck, startWith, tap } from 'rxjs';
import { WaterfallRightholderForm } from '@blockframes/waterfall/form/right-holder.form';

@Component({
  selector: 'crm-rightholder',
  templateUrl: './rightholder.component.html',
  styleUrls: ['./rightholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightholderComponent {

  public rightholder$ = combineLatest([this.route.params.pipe(pluck('rightholderId')), this.shell.waterfall$]).pipe(
    map(([rightholderId, waterfall]) => waterfall.rightholders.find(r => r.id === rightholderId)),
    tap(rightholder => this.rightholderForm.setValue(rightholder))
  );

  public rights$: Observable<(Right & { revenue: PricePerCurrency })[]> = combineLatest([this.rightholder$, this.shell.state$.pipe(startWith(undefined)), this.shell.rights$]).pipe(
    map(([rightholder, state, rights]) => rights
      .filter(r => r.rightholderId === rightholder.id)
      .map(r => ({ ...r, revenue: { [mainCurrency]: state?.waterfall.state.rights[r.id]?.revenu.actual || 0 } }))
    )
  );

  public rightholderForm = new WaterfallRightholderForm({});

  public versions = this.shell.waterfall.versions;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.shell.setDate(undefined);
  }

  public async save() {
    const formValue: WaterfallRightholder = this.rightholderForm.value;
    if (!formValue.lockedVersionId) delete formValue.lockedVersionId;
    const rightholders = this.shell.waterfall.rightholders.map(r => r.id === formValue.id ? formValue : r);
    await this.waterfallService.update({ id: this.shell.waterfall.id, rightholders });
    this.snackBar.open('Roles updated', 'close', { duration: 3000 });
  }
}