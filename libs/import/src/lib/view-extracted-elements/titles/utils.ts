import { UserService } from '@blockframes/user/+state';
import {
  MovieImportState,
  getOptionalWarning,
} from '@blockframes/import/utils';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import {
  LanguageRecord,
  MovieStakeholders,
  createMovie,
  Stakeholder,
  StakeholderRole,
  App,
  Movie
} from '@blockframes/model';
import { FieldsConfig, FieldsConfigType, getFieldConfigs } from './fieldConfigs';


export async function formatTitle(
  sheetTab: SheetTab,
  userService: UserService,
  blockframesAdmin: boolean,
  userOrgId: string,
  currentApp: App
) {
  const titles: MovieImportState[] = [];

  const fieldsConfig: FieldsConfigType = getFieldConfigs(
    userService,
    blockframesAdmin,
    userOrgId,
    currentApp
  );

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 10);
  for (const result of results) {
    const { data, errors } = result;

    if (!data.stakeholders) {
      errors.push(getOptionalWarning('Stakeholders'));
    }

    const getStakeholders = (role: StakeholderRole): Stakeholder[] =>
      data.stakeholders?.filter((s) => s.role === role) ?? [];

    const stakeholders: MovieStakeholders = {
      productionCompany: getStakeholders('executiveProducer'),
      coProductionCompany: getStakeholders('coProducer'),
      broadcasterCoproducer: getStakeholders('broadcasterCoproducer'),
      lineProducer: getStakeholders('lineProducer'),
      distributor: getStakeholders('distributor'),
      salesAgent: getStakeholders('salesAgent'),
      laboratory: getStakeholders('laboratory'),
      financier: getStakeholders('financier'),
    };

    const languages: LanguageRecord = {};
    if (!data.languages) {
      errors.push(getOptionalWarning('Languages'));
    } else {
      for (const { language, dubbed, subtitle, caption } of data.languages) {
        languages[language] = { dubbed, subtitle, caption };
      }
    }

    const title = createMovie({ ...data, languages, stakeholders });
    if (!title.directors?.length)
      errors.push({
        type: 'error',
        name: 'Missing Director(s)',
        reason: 'You need to fill at least one Director',
        message: 'Please edit the corresponding sheets field',
      });

    titles.push({ errors, movie: title });
  }
  return titles;
}
