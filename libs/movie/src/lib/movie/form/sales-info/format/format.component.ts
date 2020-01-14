import { MovieSalesInfoForm } from './../sales-info.form';
import { ChangeDetectionStrategy, Input } from '@angular/core';
import { Component } from '@angular/core';
import models from '../../../static-model/staticModels'

@Component({
    selector: '[form] movie-form-format',
    templateUrl: './format.component.html',
    styleUrls: ['./format.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFormatComponent {
    @Input() form: MovieSalesInfoForm;

    public staticFormats = models.MOVIE_FORMAT;

    public staticFormatsQuality = models.MOVIE_FORMAT_QUALITY;

    public staticSoundFormats = models.SOUND_FORMAT;

    public staticColor = models.COLORS;
}
