import { ToolkitModule, MOVIES } from '@blockframes/ui/storybook';
import { object } from '@storybook/addon-knobs';
import { MovieTitleFeaturesModule } from './title-features.module';
import { MovieTitleFeaturesComponent } from './title-features.component';

export default {
    title: 'Movie Title Features'
};

export const movieTitleFeatures = () => ({
    moduleMetadata: { imports: [MovieTitleFeaturesModule, ToolkitModule] },
    name: 'Movie Title Features',
    component: MovieTitleFeaturesComponent,
    template: `
    <storybook-toolkit>
      <h1 title>Movie Title Feature</h1>
      <h6>If you don't see the component, switch to dark mode</h6>
        <movie-title-features [movie]="movie"></movie-title-features>
    </storybook-toolkit>
  `,
    props: {
        movie: object('movie', MOVIES[0])
    }
});