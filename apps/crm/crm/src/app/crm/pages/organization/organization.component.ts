import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationCrmForm } from '@blockframes/admin/crm/forms/organization-crm.form';
import { fromOrg, MovieService } from '@blockframes/movie/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organization, Movie, Invitation, UserRole, createOrganizationMember, App, getAllAppsExcept } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { InvitationService } from '@blockframes/invitation/service';
import { buildJoinOrgQuery } from '@blockframes/invitation/invitation-utils';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { MatDialog } from '@angular/material/dialog';
import { EventService } from '@blockframes/event/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { BucketService } from '@blockframes/contract/bucket/service';
import { where } from 'firebase/firestore';
import { PermissionsService } from '@blockframes/permissions/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'crm-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationComponent implements OnInit {
  public orgId = '';
  public org: Organization;
  public orgForm: OrganizationCrmForm;
  public movies: Movie[];
  public members;
  public notifyCheckbox = new UntypedFormControl(true);
  public storagePath: string;
  public apps = getAllAppsExcept(['crm']);

  public invitationsFromOrganization$: Observable<Invitation[]>;
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  constructor(
    private organizationService: OrganizationService,
    private movieService: MovieService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private permissionService: PermissionsService,
    private invitationService: InvitationService,
    private eventService: EventService,
    private uploaderService: FileUploaderService,
    private contractService: ContractService,
    private dialog: MatDialog,
    private router: Router,
    private bucketService: BucketService
  ) { }

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId');
    this.org = await this.organizationService.getValue(this.orgId);

    this.orgForm = new OrganizationCrmForm();
    this.orgForm.reset(this.org);

    const movies = await this.movieService.getValue(fromOrg(this.orgId));
    this.movies = movies.filter((m) => !!m);

    this.members = await this.getMembers();
    this.cdRef.markForCheck();

    const queryConstraints1 = buildJoinOrgQuery(this.orgId, 'invitation');
    const queryConstraints2 = buildJoinOrgQuery(this.orgId, 'request');

    this.invitationsFromOrganization$ = this.invitationService.valueChanges(queryConstraints1);
    this.invitationsToJoinOrganization$ = this.invitationService.valueChanges(queryConstraints2);
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

  private async getMembers() {
    const [members, role] = await Promise.all([
      this.organizationService.getMembers(this.orgId),
      this.permissionService.getValue(this.orgId)
    ]);
    return members.map((m) => ({
      ...createOrganizationMember(m, role.roles[m.uid] ? role.roles[m.uid] : undefined),
      userId: m.uid,
      edit: {
        id: m.uid,
        link: `/c/o/dashboard/crm/user/${m.uid}`,
      },
    }));
  }

  public async update() {
    if (this.orgForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }
    const orgBefore = await this.organizationService.getValue(this.orgId);

    this.uploaderService.upload();
    const org = this.organizationService.cleanOrganization(this.orgForm.value);
    await this.organizationService.update(this.orgId, org);

    if (this.notifyCheckbox.value) {
      const before = orgBefore.appAccess;
      const after = org.appAccess;

      for (const app in after) {
        if (
          Object.keys(after[app]).every((module) => before[app][module] === false) &&
          Object.keys(after[app]).some((module) => after[app][module] === true)
        ) {
          this.organizationService.notifyAppAccessChange({ orgId: this.orgId, app: app as App });
        }
      }
    }

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
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

  public async deleteOrg() {
    const simulation = await this.simulateDeletion(this.orgId);
    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: `You are currently deleting '${this.org.name}' from Archipel, are you sure?`,
        text: "If yes, please write 'HARD DELETE' inside the form below.",
        warning: 'You will also delete everything regarding this organization',
        simulation,
        confirmationWord: 'hard delete',
        confirmButtonText: 'delete',
        onConfirm: async () => {
          await this.organizationService.remove(this.orgId);
          this.snackBar.open('Organization deleted!', 'close', { duration: 5000 });
          this.router.navigate(['c/o/dashboard/crm/organizations']);
        }
      })
    });
  }

  /**
   * Simulate how many others documents will be deleted if we delete this organization
   * @param organization The organization that will be deleted
   */
  private async simulateDeletion(orgId: string) {
    const organization = await this.organizationService.getValue(orgId);
    const output: string[] = [];

    // Calculate how many users will be remove from the org
    const users = organization.userIds;
    if (users.length) {
      output.push(`${users.length} user(s) will be erased from the organization.`);
    }

    // Calculate how many movie will be removed
    const movies = await this.movieService.getValue([where('orgIds', 'array-contains', organization.id)]);
    if (movies.length) {
      output.push(`${movies.length} movie(s) will be deleted.`);
    }

    // Calculate how many events will be removed
    const ownerEvent = await this.eventService.getValue([where('ownerOrgId', '==', organization.id)]);
    if (ownerEvent.length) {
      output.push(`${ownerEvent.length} event(s) will be cancelled or deleted.`);
    }

    // Calculate how many invitation will be removed
    const invitFrom = await this.invitationService.getValue([where('fromOrg.id', '==', organization.id)]);
    const invitTo = await this.invitationService.getValue([where('toOrg.id', '==', organization.id)]);
    const allInvit = [...invitFrom, ...invitTo];
    if (allInvit.length) {
      output.push(`${allInvit.length} invitation(s) will be removed.`);
    }

    // Calculate how many contracts will be updated
    const contracts = await this.contractService.getValue([where('partyIds', 'array-contains', organization.id)]);
    if (contracts.length) {
      output.push(`${contracts.length} contract(s) will be updated.`);
    }

    // Check bucket content
    const bucket = await this.bucketService.getValue(orgId);
    if (bucket) {
      output.push(`1 bucket containing ${bucket.contracts.length} contract(s) will be deleted.`);
    }

    return output;
  }

  goToMovieEdit(movie: Movie) {
    this.router.navigate([`/c/o/dashboard/crm/movie/${movie.id}`]);
  }
}
