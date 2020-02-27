import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { OrganizationService, Organization, OrganizationStatus } from '@blockframes/organization';
import { ActivatedRoute } from '@angular/router';
import { OrganizationAdminForm } from '../../forms/organization-admin.form';
import { MovieService } from '@blockframes/movie';
import { getValue } from '@blockframes/utils/helpers';
import { MemberService } from '@blockframes/organization/member/+state/member.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {
  public orgId = '';
  public org: Organization;
  public orgForm: OrganizationAdminForm;
  public statuses: string[];
  public organizationStatus: any;
  public movies: any[];
  public members: any[];

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
    'name': 'Name',
    'surname': 'Surname',
    'role': 'Org role',
    'edit': 'Edit',
  };

  public initialColumnsMembers: string[] = [
    'uid',
    'avatar',
    'email',
    'name',
    'surname',
    'role',
    'edit',
  ];
  constructor(
    private organizationService: OrganizationService,
    private memberService: MemberService,
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
    this.movies = movies.map(m => {
      const row = {...m} as any;

      // Edit link
      row.edit = {
        id: m.id,
        link: `/c/o/admin/panel/movie/${m.id}`,
      }

      return row;
    });

    const members = await this.memberService.getMembers(this.orgId);
    this.members = members.map(m => {
      const row = {...m} as any;

      // Edit link
      row.edit = {
        id: m.uid,
        link: `/c/o/admin/panel/member/${m.uid}`,
      }
      
      return row;
    });

    this.statuses = Object.keys(OrganizationStatus);
    this.organizationStatus = OrganizationStatus;
    this.cdRef.markForCheck();
  }

  public async update() {
    if (this.orgForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      status: this.orgForm.get('status').value,
      appAccess: {
        catalogDashboard: this.orgForm.get('catalogDashboard').value,
        catalogMarketplace: this.orgForm.get('catalogMarketplace').value,
      }
    }

    await this.organizationService.update(this.orgId, update);

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
      'name',
      'surname',
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

  public getOrgEditPath(orgId: string) {
    return `/c/o/organization/${orgId}/view/org`;
  }

}
