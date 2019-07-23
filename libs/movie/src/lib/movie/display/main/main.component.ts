import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieMain } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[data] movie-display-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayMainComponent {

  @Input() data: MovieMain;

  /* Returns label from json staticModels */
  public getStaticBySlug(scope: string, slug: string) {
    return getLabelBySlug(scope, slug) as string;
  }
}
