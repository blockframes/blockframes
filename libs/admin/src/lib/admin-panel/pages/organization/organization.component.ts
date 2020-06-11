import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationAdminForm } from '../../forms/organization-admin.form';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getValue } from '@blockframes/utils/helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { organizationStatus } from '@blockframes/organization/+state/organization.firestore';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { app } from '@blockframes/utils/apps';
import { FormControl } from '@angular/forms';
import { UserRole, PermissionsService } from '@blockframes/permissions/+state';

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
  public organizationStatus = organizationStatus;
  public movies: any[];
  public app = app;
  public members: any[];
  public notifyCheckbox = new FormControl(false);
  public storagePath: string;

  public versionColumnsMovies = {
    'id': 'Id',
    'main.internalRef': 'Internal Ref',
    'promotionalElements.poster': 'Poster',
    'main.title.original': 'Original title',
    'main.productionYear': 'Production year',
    'main.storeConfig.status': 'Status',
    'main.storeConfig.storeType': 'Store type',
    'edit': 'Edit',
  };

  public initialColumnsMovies: string[] = [
    'id',
    'promotionalElements.poster',
    'main.internalRef',
    'main.title.original',
    'main.productionYear',
    'main.storeConfig.status',
    'main.storeConfig.storeType',
    'edit',
  ];

  public memberColumns = {
    userId: 'Id',
    firstName: 'First Name',
    avatar: 'Avatar',
    lastName: 'Last Name',
    email: 'Email Address',
    position: 'Position',
    role: 'Permissions',
    edit: 'Edit',
  };

  public memberColumnsIndex = ['userId', 'firstName', 'avatar', 'lastName', 'email', 'position', 'role', 'edit'];

  constructor(
    private organizationService: OrganizationService,
    private movieService: MovieService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private permissionService: PermissionsService,
  ) { }

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId');
    this.org = await this.organizationService.getValue(this.orgId);
    this.storagePath = `orgs/${this.orgId}/logo`;
    this.orgForm = new OrganizationAdminForm(this.org);

    const moviePromises = this.org.movieIds.map(m => this.movieService.getValue(m));
    const movies = await Promise.all(moviePromises);
    this.movies = movies.filter(m => !!m).map(m => ({
      ...m,
      edit: {
        id: m.id,
        link: `/c/o/admin/panel/movie/${m.id}`,
      }
    }));

    await this.loadMembers();
  }

  private async loadMembers(){
    const members = await this.organizationService.getMembers(this.orgId);
    this.members = members.map(m => ({
      ...m,
      userId: m.uid,
      edit: {
        id: m.uid,
        link: `/c/o/admin/panel/user/${m.uid}`,
      }
    }));
    this.cdRef.markForCheck();
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
      'main.internalRef',
      'main.title.original',
      'main.productionYear',
      'main.storeConfig.status',
      'main.storeConfig.storeType',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }


  public getMoviePath(movieId: string, segment: string = 'main') {
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
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
    await this.loadMembers();
    return this.snackBar.open(message, 'close', { duration: 2000 });
  }

  public async removeMember(uid: string) {
    try {
      this.organizationService.removeMember(uid);
      await this.loadMembers();
      this.snackBar.open('Member removed.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
