import { ReviewCardModule } from './review-card.module';
import { ToolkitModule } from '../storybook';
import { object } from '@storybook/addon-knobs';

export default {
  title: 'Review Card'
};

export const reviewCard = () => ({
  moduleMetadata: { imports: [ReviewCardModule, ToolkitModule] },
  name: 'Review Card',
  template: `
    <storybook-toolkit>
      <h1 title>Review Card</h1>
      <review-card [review]="review"></review-card>
    </storybook-toolkit>
  `,
  props: {
    review: object('review', {
      criticQuote:
        'Aenean euismod, massa non imperdiet tincidunt, nibh enim tempus neque, quis molestie nisi mi ut elit. Fusce tristique eu tellus non consectetur.',
      journalName: 'LES CAHIERS DU CINÉMA',
    })
  }
});