import { OrganizationOperation } from './../../+state/organization.model';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery, OrganizationService } from '../../+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { tap, switchMap, startWith, filter, map } from 'rxjs/operators';
import { createOperationFormList } from '../../forms/operations.form';

@Component({
  selector: 'org-admin-view',
  templateUrl: './organization-admin-view.component.html',
  styleUrls: ['./organization-admin-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationAdminViewComponent implements OnInit {
  /** Observable that contains all the signers in an organization */
  // public organization$ = new Observable<Organization>();
  public operations$: Observable<OrganizationOperation[]>;
  private selectedOperationId$ = new BehaviorSubject<string>(null);
  public operationFormList = createOperationFormList();
  public operationFormGroup$: Observable<FormGroup>;



  /** Flag to indicate if sidenav is open */
  public opened = false;

  /** Variable to indicate whether to show an action in the sidenav or a member */
  public editContent: 'operation' | 'member';

  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService
  ) {}

  ngOnInit() {

    /** Return the operationFormGroup linked to the selected operation.id */
    this.operations$ = this.query.select('org').pipe(
      tap(organisation => console.log('query select', organisation)),
      map(organization => organization.operations),
      tap(operations => this.operationFormList.patchValue(operations)),
      switchMap(operations => this.operationFormList.valueChanges.pipe(startWith(operations)))
    );

    this.operationFormGroup$ = this.selectedOperationId$.pipe(
      filter(operationId => !!operationId),
      tap(memberId => console.log(memberId, this.operationFormList.value)),
      map(operationId => this.operationFormList.value.findIndex(operation => operation.id === operationId)),
      tap(index => console.log('selectOp at', index)),
      map(index => this.operationFormList.controls[index]),
    );
  }

  public openSidenavOperation(operationId: string) {
    this.selectedOperationId$.next(operationId);
    this.editContent = 'operation';
    this.opened = true;
  }

  // public deleteActiveSigner({member, operation}: {member: OrganizationMember, operation: OrganizationOperation}) {
  //   this.service.removeOperationMember(operation.id, member);
  // }

  // /** This function should get triggered by the input field */
  // public addSigner(name: string) {
  //   // TODO(#682): Add a signer to the organization. Also the input field should
  //   // have some autocompletion, where to look for the correct member?
  //   console.log('implement me in the service ' + name);
  // }

  // // TODO(#682)
  // public openOptions(editContent: 'action' | 'member', member: OrganizationMember) {
  //   this.opened = true;
  //   this.editContent = this.editContent;
  // }
}
