import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Template } from '../../template/+state/template.model';
import { MatDialogRef } from '@angular/material';
import { TemplateService} from '../../template/+state/template.service';
import { TemplateQuery } from '../../template/+state/template.query';
import { TemplateStore } from '../../template/+state/template.store';
import { MaterialService } from '../../material/+state/material.service';
import { MovieQuery } from '@blockframes/movie';
import { Router } from '@angular/router';

@Component({
  selector: 'delivery-template-picker',
  templateUrl: './template-picker.component.html',
  styleUrls: ['./template-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatePickerComponent implements OnInit {

  public templates$: Observable<Template[]>;

  constructor(
    public dialogRef: MatDialogRef<TemplatePickerComponent>,
    public templateService: TemplateService,
    public materialService: MaterialService,
    public templateQuery: TemplateQuery,
    public templateStore: TemplateStore,
    public movieQuery: MovieQuery,
    public router: Router,
    ) {}

  ngOnInit() {
    this.templateService.subscribeOnOrganizationTemplates$.subscribe(); //todo unsubscribe
    this.materialService.subscribeOnOrganizationMaterials$.subscribe(); //todo unsubscribe

    this.templates$ = this.templateQuery.selectAll();
  }

  public selectTemplate(templateId? : string) {
    const movieId = this.movieQuery.getActiveId();
    if (!!templateId) {
    this.templateStore.setActive(templateId);
    this.router.navigate([`delivery/${movieId}/form`]);
    this.dialogRef.close();
    } else {
      this.templateStore.setActive(null);
      this.router.navigate([`delivery/${movieId}/form`]);
      this.dialogRef.close();
    }
  }

  public close() {
    this.dialogRef.close();
  }
}
