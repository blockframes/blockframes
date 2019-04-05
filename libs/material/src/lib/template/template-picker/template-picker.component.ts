import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Template } from '../../template/+state/template.model';
import { MatDialogRef } from '@angular/material';
import { TemplateService} from '../../template/+state/template.service';
import { TemplateQuery } from '../../template/+state/template.query';
import { TemplateStore } from '../../template/+state/template.store';
import { MaterialService } from '../../material/+state/material.service';
import { Router } from '@angular/router';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { AngularFirestore } from '@angular/fire/firestore';
import { DeliveryService } from '../../delivery/+state/delivery.service';
import { DeliveryQuery } from '../../delivery/+state';

@Component({
  selector: 'delivery-template-picker',
  templateUrl: './template-picker.component.html',
  styleUrls: ['./template-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatePickerComponent implements OnInit {

  public templates$: Observable<Template[]>;

  constructor(
    private dialogRef: MatDialogRef<TemplatePickerComponent>,
    private templateService: TemplateService,
    private deliveryService: DeliveryService,
    private materialService: MaterialService,
    private templateQuery: TemplateQuery,
    private templateStore: TemplateStore,
    private movieQuery: MovieQuery,
    private query: DeliveryQuery,
    private db: AngularFirestore,
    private router: Router,
    ) {}

  ngOnInit() {
    this.templateService.subscribeOnOrganizationTemplates$.subscribe(); //todo unsubscribe
    this.materialService.subscribeOnActiveOrganizationMaterials$.subscribe(); //todo unsubscribe

    this.templates$ = this.templateQuery.selectAll();
  }

  public createDelivery(templateId?: string) {
    const movieId = this.movieQuery.getActiveId();

    if (!!templateId) {
      this.templateStore.setActive(templateId);
    }

    this.deliveryService.addDelivery(templateId);
    this.router.navigate([`layout/${movieId}/form/${this.query.getActiveId()}`]);
    this.close();
  }

  public close() {
    this.dialogRef.close();
  }
}
