import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Template, TemplateQuery, TemplateService } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MaterialService } from '../../material/+state';
import { AddTemplateComponent } from './add-template';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { map } from 'rxjs/operators';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  public templates$: Observable<any>;


  constructor(
    private service: TemplateService,
    private query: TemplateQuery,
    public dialog: MatDialog,
    private materialService: MaterialService,
  ) {
  }

  ngOnInit() {
    this.service.subscribeOnAllOrgsTemplates$.subscribe(); //todo unsubscribe
    this.materialService.subscribeOnAllOrgsMaterials$.subscribe(); //todo unsubscribe

    this.templates$ = this.query.templatesByOrgs$
  }

  public addTemplateDialog(): void {
    this.dialog.open(AddTemplateComponent, {
      width: '400px'
    });
  }

  public deleteTemplate(id: string) {
    this.service.deleteTemplate(id);
  }

}

