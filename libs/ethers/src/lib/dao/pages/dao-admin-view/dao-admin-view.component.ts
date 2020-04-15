import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { tap, switchMap, startWith, filter, map } from 'rxjs/operators';
import { createMemberFormList } from '@blockframes/organization/forms/member.form'
import { OrganizationMember } from '@blockframes/user/+state/user.model';
import { UserQuery } from '@blockframes/user/+state/user.query';
import { DaoQuery, DaoOperation, DeploySteps } from '../../+state';
import { createOperationFormList } from '../../forms/operations.form';

@Component({
  selector: 'dao-admin-view',
  templateUrl: './dao-admin-view.component.html',
  styleUrls: ['./dao-admin-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaoAdminViewComponent implements OnInit {

  public operations$: Observable<DaoOperation[]>;
  private selectedOperationId$ = new BehaviorSubject<string>(null);
  public operationFormList = createOperationFormList();
  public operationFormGroup$: Observable<FormGroup>;

  public members$: Observable<OrganizationMember[]>;
  private selectedMemberId$ = new BehaviorSubject<string>(null);
  public memberFormList = createMemberFormList();
  public memberFormGroup$: Observable<FormGroup>;

  public organizationName: string;

  /** Flag to indicate if sidenav is open */
  public opened = false;

  /** Variable to indicate whether to show an action in the sidenav or a member */
  public editContent: 'operation' | 'member';

  public isDeploying$: Observable<boolean>;
  public deployStep$: Observable<string>;
  public deployProgress$: Observable<number>;

  constructor(
    private query: DaoQuery,
    private userQuery: UserQuery
  ) {}

  ngOnInit() {

    this.isDeploying$ = this.query.select().pipe(map(state => state.isDeploying));
    this.deployStep$ = this.query.select().pipe(
      map(state => state.deployStep),
      map(step => {
        switch(step) {
          case DeploySteps.registered: return 'Registered (1/3)';
          case DeploySteps.resolved: return 'Resolved (2/3)';
          case DeploySteps.ready: return 'Retrieving information (3/3)';
          default: return 'Not deployed (0/3)';
        }
      })
    );
    this.deployProgress$ = this.query.select().pipe(
      map(state => state.deployStep),
      map(step => {
        switch(step) {
          case DeploySteps.registered: return 25;
          case DeploySteps.resolved: return 50;
          case DeploySteps.ready: return 75;
          default: return 0;
        }
      })
    );

    /** Return the operationFormGroup linked to the selected operation.id */
    this.operations$ = this.query.select().pipe(
      tap(dao => this.organizationName = dao.name),
      filter(dao => !!dao.operations),
      map(dao => dao.operations),
      tap(operations => this.operationFormList.patchAllValue(operations)),
      switchMap(operations => this.operationFormList.valueChanges.pipe(startWith(operations)))
    );
    this.operationFormGroup$ = this.selectedOperationId$.pipe(
      filter(operationId => !!operationId),
      map(operationId => this.operationFormList.value.findIndex(operation => operation.id === operationId)),
      map(index => this.operationFormList.at(index)),
    );


    this.members$ = this.userQuery.membersWithRole$.pipe(
      tap(members => this.memberFormList.patchAllValue(members)),
      switchMap(members => this.memberFormList.valueChanges.pipe(startWith(members))),
    );
    this.memberFormGroup$ = this.selectedMemberId$.pipe(
      filter(memberId => !!memberId),
      map(memberId => this.memberFormList.value.findIndex(member => member.uid === memberId)),
      map(index => this.memberFormList.at(index))
    )
  }

  public openSidenav(context: 'member' | 'operation', id: string) {
    context === 'member'
      ? this.selectedMemberId$.next(id)
      : this.selectedOperationId$.next(id)
    this.editContent = context;
    this.opened = true;
  }
}
