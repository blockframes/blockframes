import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieStoryForm } from '../../story/story.form';
import { MoviePromotionalDescriptionForm } from '../../promotional-description/promotional-description.form';

@Component({
  selector: '[story] [promotionalDescription] movie-summary-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryStoryComponent {
  @Input() story: MovieStoryForm;
  @Input() promotionalDescription: MoviePromotionalDescriptionForm;
}
