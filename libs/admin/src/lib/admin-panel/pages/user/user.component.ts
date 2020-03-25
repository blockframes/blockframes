import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@blockframes/auth/+state/auth.store';
import { UserAdminForm } from '../../forms/user-admin.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@blockframes/user/+state/user.service';

@Component({
  selector: 'admin-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  public userId = '';
  public user: User;
  public isUserBlockframesAdmin = false;
  public userForm: UserAdminForm;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.userId = params.userId;
      this.user = await this.userService.getUser(this.userId);
      this.userForm = new UserAdminForm(this.user);
      this.isUserBlockframesAdmin = await this.userService.isBlockframesAdmin(this.userId);
      this.cdRef.markForCheck();
    });
  }

  public async update() {
    if (this.userForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const { email, orgId, name, surname, phoneNumber, position } = this.userForm.value

    const update = {
      email,
      orgId,
      name,
      surname,
      phoneNumber,
      position
    };

    await this.userService.updateById(this.user.uid, update);

    this.user = await this.userService.getUser(this.userId);
    this.cdRef.markForCheck();

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }


  public async setBlockframesAdmin() {
    this.isUserBlockframesAdmin = !this.isUserBlockframesAdmin;
    await this.userService.setBlockframesAdmin(this.isUserBlockframesAdmin, this.userId);
    this.cdRef.markForCheck();
  }

  public getOrgEditPath(orgId: string) {
    return `/c/o/organization/${orgId}/view/org`;
  }

  public getOrgPath(orgId: string) {
    return `/c/o/admin/panel/organization/${orgId}`;
  }
}
