import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationAdminForm } from '../../forms/organization-admin.form';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getValue } from '@blockframes/utils/helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { staticConsts } from '@blockframes/utils/static-model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { app } from '@blockframes/utils/apps';
import { FormControl } from '@angular/forms';
import { UserRole, PermissionsService } from '@blockframes/permissions/+state';
import { Observable } from 'rxjs';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { buildJoinOrgQuery } from '@blockframes/invitation/invitation-utils';

@Component({
  selector: 'admin-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {
  public orgId = '';
  public org: Organization;
  public orgForm: OrganizationAdminForm;
  public organizationStatus = staticConsts.organizationStatus;
  public movies: any[];
  public app = app;
  public members: any[];
  public notifyCheckbox = new FormControl(false);
  public storagePath: string;

  public invitationsFromOrganization$: Observable<Invitation[]>;
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  public versionColumnsMovies = {
    'id': 'Id',
    'internalRef': 'Internal Ref',
    'poster': 'Poster',
    'title': 'Original title',
    'releaseYear': 'Release year',
    'status': 'Status',
    'storeType': 'Store type',
    'edit': 'Edit',
  };

  public initialColumnsMovies: string[] = [
    'id',
    'poster',
    'internalRef',
    'title',
    'releaseYear',
    'status',
    'storeType',
    'edit',
  ];

  public memberColumns = {
    uid: '',
    firstName: 'First Name',
    avatar: 'Avatar',
    lastName: 'Last Name',
    email: 'Email Address',
    position: 'Position',
    role: 'Permissions',
    edit: 'Edit',
  };

  public memberColumnsIndex = ['uid', 'firstName', 'avatar', 'lastName', 'email', 'position', 'role', 'edit'];

  constructor(
    private organizationService: OrganizationService,
    private movieService: MovieService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private permissionService: PermissionsService,
    private invitationService: InvitationService,
  ) { }

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId');
    this.org = await this.organizationService.getValue(this.orgId);
    this.storagePath = `orgs/${this.orgId}/logo`;
    this.orgForm = new OrganizationAdminForm(this.org);

    const moviePromises = this.org.movieIds.map(m => this.movieService.getValue(m));
    const movies = await Promise.all(moviePromises);
    this.movies = movies.filter(m => !!m).map(m => ({
      id: m.id,
      internalRef: m.internalRef,
      poster: m.poster,
      title: m.title.original,
      releaseYear: m.release.year,
      status: m.storeConfig.status,
      storeType: m.storeConfig.storeType,
      edit: {
        id: m.id,
        link: `/c/o/admin/panel/movie/${m.id}`,
      }
    }));

    this.members = await this.getMembers();
    this.cdRef.markForCheck();

    const queryFn1 = buildJoinOrgQuery(this.orgId, 'invitation');
    const queryFn2 = buildJoinOrgQuery(this.orgId, 'request');

    this.invitationsFromOrganization$ = this.invitationService.valueChanges(queryFn1);
    this.invitationsToJoinOrganization$ = this.invitationService.valueChanges(queryFn2);

  }

  public acceptInvitation(invitation: Invitation) {
    this.invitationService.acceptInvitation(invitation);
  }

  public declineInvitation(invitation: Invitation) {
    this.invitationService.declineInvitation(invitation);
  }

  public deleteInvitation(invitation: Invitation) {
    this.invitationService.remove(invitation.id);
  }

  private async getMembers(){
    const members = await this.organizationService.getMembers(this.orgId);
    return members.map(m => ({
      ...m,
      userId: m.uid,
      edit: {
        id: m.uid,
        link: `/c/o/admin/panel/user/${m.uid}`,
      }
    }));
  }

  public async update() {
    if (this.orgForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const { denomination, email, addresses, activity, fiscalNumber, status, appAccess } = this.orgForm.value;
    const update = { denomination, email, addresses, activity, fiscalNumber, status, appAccess };

    // @TODO (#2987) (check org import via excel)
    await this.organizationService.update(this.orgId, update);
    if (this.notifyCheckbox.value) {
      this.organizationService.notifyAppAccessChange(this.orgId);
    }

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  filterPredicateMovies(data: any, filter) {
    const columnsToFilter = [
      'id',
      'internalRef',
      'title.original',
      'releaseYear',
      'storeConfig.status',
      'storeConfig.storeType',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public async uniqueOrgName() {
    const orgName = this.orgForm.get('denomination').get('full').value
    const unique = await this.organizationService.uniqueOrgName(orgName);
    if (!unique) {
      this.orgForm.get('denomination').get('full').setErrors({ notUnique: true });
    }
  }

  /** Update user role. */
  public async updateRole(uid: string, role: UserRole) {
    const message = await this.permissionService.updateMemberRole(uid, role);
    this.members = await this.getMembers();
    this.cdRef.markForCheck();
    return this.snackBar.open(message, 'close', { duration: 2000 });
  }

  public async removeMember(uid: string) {
    try {
      await this.organizationService.removeMember(uid);
      this.members = await this.getMembers();
      this.cdRef.markForCheck();
      this.snackBar.open('Member removed.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
