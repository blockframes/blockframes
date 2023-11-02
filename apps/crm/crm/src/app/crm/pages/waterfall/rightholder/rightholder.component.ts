import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  PricePerCurrency,
  Right,
  RightholderRole,
  Statement,
  WaterfallPermissions,
  WaterfallRightholder,
  getStatementsHistory,
  mainCurrency,
  movieCurrencies
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { Observable, combineLatest, map, pluck, tap } from 'rxjs';
import { WaterfallRightholderForm } from '@blockframes/waterfall/form/right-holder.form';
import { FormControl } from '@angular/forms';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';

const rolesWithStatements: RightholderRole[] = ['salesAgent', 'mainDistributor', 'localDistributor', 'producer', 'coProducer'];

@Component({
  selector: 'crm-rightholder',
  templateUrl: './rightholder.component.html',
  styleUrls: ['./rightholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightholderComponent {

  public permissions$ = this.shell.permissions$;

  public rightholder$ = combineLatest([this.route.params.pipe(pluck('rightholderId')), this.shell.waterfall$, this.permissions$]).pipe(
    tap(([rightholderId, _, permissions]) => this.permissionControl.setValue(permissions.filter(p => p.rightholderIds.includes(rightholderId)).map(p => p.id))),
    map(([rightholderId, waterfall]) => waterfall.rightholders.find(r => r.id === rightholderId)),
    tap(rightholder => this.rightholderForm.setValue(rightholder))
  );

  public rights$: Observable<(Right & { revenue: PricePerCurrency })[]> = combineLatest([this.rightholder$, this.shell.state$, this.shell.rights$]).pipe(
    map(([rightholder, state, rights]) => rights
      .filter(r => r.rightholderId === rightholder.id)
      .map(r => ({ ...r, revenue: { [mainCurrency]: state.waterfall.state.rights[r.id]?.revenu.actual || 0 } }))
    )
  );

  public graph$ = combineLatest([this.shell.state$, this.rightholder$, this.shell.statements$]).pipe(
    map(([state, rightholder, statements]) => rightholder.roles.some(r => rolesWithStatements.includes(r)) ?
      this.buildGraph(state, rightholder, statements) :
      undefined
    )
  );

  public rightholderForm = new WaterfallRightholderForm({});
  public permissionControl = new FormControl<string[]>([]);
  public formatter = { formatter: (value: number) => `${value} ${movieCurrencies[mainCurrency]}` };

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private waterfallPermissionService: WaterfallPermissionsService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.shell.setDate(undefined);
  }

  public async save(permissions: WaterfallPermissions[]) {
    const formValue: WaterfallRightholder = this.rightholderForm.value;
    const rightholders = this.shell.waterfall.rightholders.map(r => r.id === formValue.id ? formValue : r);

    const selectedPermissions = permissions.filter(p => this.permissionControl.value.find(id => id === p.id));
    const notSelectedPermissions = permissions.filter(p => !selectedPermissions.find(sp => sp.id === p.id));

    const promises = [this.waterfallService.update({ id: this.shell.waterfall.id, rightholders })];
    for (const permission of selectedPermissions) {
      if (!permission.rightholderIds.includes(formValue.id)) {
        permission.rightholderIds.push(formValue.id);
        promises.push(this.waterfallPermissionService.update(permission, { params: { waterfallId: this.shell.waterfall.id } }));
      }
    }

    for (const permission of notSelectedPermissions) {
      if (permission.rightholderIds.includes(formValue.id)) {
        permission.rightholderIds = permission.rightholderIds.filter(id => id !== formValue.id);
        promises.push(this.waterfallPermissionService.update(permission, { params: { waterfallId: this.shell.waterfall.id } }));
      }
    }

    await Promise.all(promises);
    this.snackBar.open('Roles updated', 'close', { duration: 3000 });
  }

  private buildGraph(state: WaterfallState, rightholder: WaterfallRightholder, statements: Statement[]) {
    if (!state?.version.id) return;
    const history = getStatementsHistory(state.waterfall.history, statements, rightholder.id);
    const categories = history.map(h => new Date(h.date).toISOString().slice(0, 10));
    const series = [
      {
        name: 'Profits',
        data: history.map(h => Math.round(h.orgs[rightholder.id].revenu.actual))
      },
      {
        name: 'Distributed',
        data: history.map(h => {
          const orgState = h.orgs[rightholder.id];
          return Math.round(orgState.turnover.actual - orgState.revenu.actual);
        })
      }
    ];
    return { xAxis: { categories }, series };
  }
}