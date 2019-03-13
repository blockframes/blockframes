import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQuery, User } from '@blockframes/auth';
import { ActivatedRoute } from '@angular/router';
import { Organization, OrganizationQuery, OrganizationService } from '../+state';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'org-show',
  templateUrl: './org-show.component.html',
  styleUrls: ['./org-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgShowComponent implements OnInit, OnDestroy {
  public org$: Observable<Organization>;
  public addMemberForm: FormGroup;
  private orgID: string;

  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private auth: AuthQuery,
    private snackBar: MatSnackBar,
    private builder: FormBuilder,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    
    this.auth.user$().subscribe((user: User) => {
      // @todo remove observable on ngDestroy
      this.service.subscribeUserOrgs(user.uid);
    });

    this.org$ = this.route.params.pipe(switchMap(({ id }) => {
      this.orgID = id;
      return this.query.selectEntity(id);
    }));
    this.addMemberForm = this.builder.group({
      id: '',
      role: ''
    });
  }

  ngOnDestroy() {
  }
}
