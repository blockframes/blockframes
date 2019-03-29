import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Template, TemplateQuery, TemplateService } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MaterialService } from '../../material/+state';
import { AddTemplateComponent } from './add-template';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  public templates$: Observable<Template[]>;

  constructor(
    private service: TemplateService,
    private query: TemplateQuery,
    public dialog: MatDialog,
    private materialService: MaterialService
  ) {
  }

  ngOnInit() {
    this.service.subscribeOnOrganizationTemplates$.subscribe(); //todo unsubscribe
    this.materialService.subscribeOnOrganizationMaterials$.subscribe(); //todo unsubscribe

    this.templates$ = this.query.selectAll();
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

