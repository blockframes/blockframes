import { OrganizationOperation, OrganizationMember } from './../../+state/organization.model';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '../../+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { tap, switchMap, startWith, filter, map } from 'rxjs/operators';
import { createOperationFormList } from '../../forms/operations.form';
import { createMemberFormList } from '../../forms/member.form';

@Component({
  selector: 'org-admin-view',
  templateUrl: './organization-admin-view.component.html',
  styleUrls: ['./organization-admin-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAdminViewComponent implements OnInit {

  public operations$: Observable<OrganizationOperation[]>;
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

  constructor(
    private query: OrganizationQuery,
  ) {}

  ngOnInit() {

    /** Return the operationFormGroup linked to the selected operation.id */
    this.operations$ = this.query.select('org').pipe(
      tap(organization => this.organizationName = organization.name),
      map(organization => organization.operations),
      tap(operations => this.operationFormList.patchValue(operations)),
      switchMap(operations => this.operationFormList.valueChanges.pipe(startWith(operations)))
    );
    this.operationFormGroup$ = this.selectedOperationId$.pipe(
      filter(operationId => !!operationId),
      map(operationId => this.operationFormList.value.findIndex(operation => operation.id === operationId)),
      map(index => this.operationFormList.controls[index]),
    );


    this.members$ = this.query.select('org').pipe(
      map(organization => organization.members),
      tap(members => this.memberFormList.patchValue(members)),
      switchMap(members => this.memberFormList.valueChanges.pipe(startWith(members))),
    );
    this.memberFormGroup$ = this.selectedMemberId$.pipe(
      filter(memberId => !!memberId),
      map(memberId => this.memberFormList.value.findIndex(member => member.uid === memberId)),
      map(index => this.memberFormList.controls[index])
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
