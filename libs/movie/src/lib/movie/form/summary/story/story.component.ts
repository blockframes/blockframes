import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieStoryForm } from '../../story/story.form';
import { MoviePromotionalDescriptionForm } from '../../promotional-description/promotional-description.form';

@Component({
  selector: '[story] [promotionalDescription] movie-summary-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryStoryComponent implements OnInit {
  @Input() story: MovieStoryForm;
  @Input() promotionalDescription: MoviePromotionalDescriptionForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.story.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.promotionalDescription.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
