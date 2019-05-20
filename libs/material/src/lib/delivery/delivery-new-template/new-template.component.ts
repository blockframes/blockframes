import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { TemplateService } from '../../template/+state/template.service';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { FormGroup, FormControl } from '@angular/forms';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewTemplateComponent implements OnInit, OnDestroy {
  public orgs$: Observable<Organization[]>;
  public isUpdateTemplate = false;
  private isAlive = true;

  public form = new FormGroup({
    name: new FormControl(),
    organization: new FormControl()
  });

  constructor(
    private dialogRef: MatDialogRef<NewTemplateComponent>,
    private templateService: TemplateService,
    private organizationQuery: OrganizationQuery,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.orgs$ = this.organizationQuery.selectAll();

    // Check if the name already exists in the selected organization
    this.form.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(values =>
      this.templateService.nameExists(values.name, values.organization)
        ? (this.isUpdateTemplate = true)
        : (this.isUpdateTemplate = false)
    );
  }

  public saveTemplate(name: string, org: Organization) {
    this.templateService.saveTemplate(name, org);
    this.dialogRef.close();
    this.snackBar.open('Saved template : ' + name + ' !', 'close', { duration: 2000 });
  }

  public updateTemplate(name: string, org: Organization) {
    this.templateService.updateTemplate(name, org);
    this.dialogRef.close();
    this.snackBar.open('Updated template : ' + name + ' !', 'close', { duration: 2000 });
  }

  public close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
