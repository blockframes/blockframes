import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from './../sales-info.form';
import models from '@blockframes/utils/static-model/staticModels'

@Component({
    selector: '[form] movie-form-scoring',
    templateUrl: './scoring.component.html',
    styleUrls: ['./scoring.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormScoringComponent {
    @Input() form: MovieSalesInfoForm;

    public staticScoring = models.SCORING;
}
