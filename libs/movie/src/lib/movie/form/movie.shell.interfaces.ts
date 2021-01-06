import { InjectionToken } from "@angular/core";
import { EntityControl, FormEntity } from '@blockframes/utils/form';
import type { CampaignShellConfig } from '@blockframes/campaign/form/campaign.shell.config';
import type { MovieShellConfig } from './movie.shell.config';
import { Observable } from 'rxjs';

export const FORMS_CONFIG = new InjectionToken<ShellConfig>('List of form managed by the shell');

export interface FormShellConfig<Control extends EntityControl<Entity>, Entity> {
    form: FormEntity<Control, Entity>;
    onInit(): Observable<any>[];
    onSave(publishing: boolean): Promise<any>
}

export interface ShellConfig {
    movie: MovieShellConfig;
    campaign?: CampaignShellConfig
}