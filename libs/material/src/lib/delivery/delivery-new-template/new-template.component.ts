import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { TemplateService } from '../../template/+state/template.service';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '@blockframes/organization';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'delivery-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewTemplateComponent implements OnInit {
  public orgs$: Observable<Organization[]>;
  public isUpdateTemplate = false;

  public form = new FormGroup({
    name: new FormControl(),
    organization: new FormControl()
  });

  constructor(
    private dialogRef: MatDialogRef<NewTemplateComponent>,
    private templateService: TemplateService,
    private organizationQuery: OrganizationQuery,
  ) {}

  ngOnInit() {
    this.orgs$ = this.organizationQuery.selectAll();

    // Check if the name already exists in the selected organization
    this.form.valueChanges.subscribe(values => {
      if (this.templateService.nameExists(values.name, values.organization)) {
        this.isUpdateTemplate = true;
      } else {
        this.isUpdateTemplate = false;
      }
    });
  }

  public async saveTemplate(name: string, orgId: string) {
    this.templateService.saveTemplate(name, orgId);
    this.dialogRef.close();
  }

  public async updateTemplate(name: string, orgId: string) {
    this.templateService.updateTemplate(name, orgId);
    this.dialogRef.close();
  }

  public close() {
    this.dialogRef.close();
  }
}
