import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { Material, MaterialStore } from '../../material/+state';
import { TemplateService } from '../+state';
import { MatDialog } from '@angular/material';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListComponent {

  @Input() template;
  @Input() name;
  @Output() save = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();

  constructor(
    private materialStore: MaterialStore,
    public dialog: MatDialog,
    private service: TemplateService,
  ) { }

  public selectCategory(materials: Material[]) {
    const materialsIds = [];
    for (const material of materials) {
      materialsIds.push(material.id);
    }
    this.materialStore.setActive(materialsIds);
  }

  public saveTemplate() {
    this.service.saveTemplate();
  }
}
