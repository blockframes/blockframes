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

  public versionColumnsMembers = {
    'uid': 'Id',
    'avatar': 'Avatar',
    'email': 'Email',
    'firstName': 'FirstName',
    'lastName': 'LastName',
    'role': 'Org role',
    'edit': 'Edit',
  };

  public initialColumnsMembers: string[] = [
    'uid',
    'avatar',
    'email',
    'firstName',
    'lastName',
    'role',
    'edit',
  ];
  constructor(
    private organizationService: OrganizationService,
    private movieService: MovieService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId');
    this.org = await this.organizationService.getValue(this.orgId);
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

    const members = await this.organizationService.getMembers(this.orgId);
    this.members = members.map(m => ({
      ...m,
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

    const update = {
      status: this.orgForm.get('status').value,
      appAccess: this.orgForm.appAccess.value,
    }

    await this.organizationService.update(this.orgId, update);
    if(this.notifyCheckbox.value){
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

  filterPredicateMembers(data: any, filter) {
    const columnsToFilter = [
      'uid',
      'email',
      'firstName',
      'lastName',
      'role'
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public getMoviePath(movieId: string, segment: string = 'main') {
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }

  public getOrgMemberPath(orgId: string) {
    return `/c/o/organization/${orgId}/view/members`;
  }

}
