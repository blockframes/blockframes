import { Firestore } from '@angular/fire/firestore';
import { collection, doc } from 'firebase/firestore';
import { checkParentTerm, ContractsImportState, sheetHeaderLine, } from '@blockframes/import/utils';
import { centralOrgId } from '@env';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { UserService } from '@blockframes/user/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Movie, Term } from '@blockframes/model';
import {
  createMandate,
  createSale,
  Mandate,
  MovieLanguageSpecification,
  Sale,
  User,
  Language,
} from '@blockframes/model';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getContractConfig } from './fieldConfigs';


function toTerm(rawTerm: FieldsConfig['term'][number], contractId: string, firestore: Firestore): Term {

  const { medias, duration, territories_excluded = [], territories_included = [], exclusive, licensedOriginal } = rawTerm;


  const languages: Term['languages'] = {};

  const updateLanguage = (key: keyof MovieLanguageSpecification, rawLanguages: Language[] = []) => {
    for (const language of rawLanguages) {
      if (!languages[language])
        languages[language] = { caption: false, dubbed: false, subtitle: false };
      languages[language][key] = true;
    }
  };

  updateLanguage('caption', rawTerm.caption);
  updateLanguage('dubbed', rawTerm.dubbed);
  updateLanguage('subtitle', rawTerm.subtitle);

  const territories = territories_included.filter(territory => !territories_excluded.includes(territory));

  const id = doc(collection(firestore, '_')).id;

  return {
    id,
    languages,
    contractId,
    medias,
    duration,
    territories,
    exclusive,
    licensedOriginal,
    criteria: [],
  };
}

export interface FormatConfig {
  isSeller: boolean;
}
export async function formatContract(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  userService: UserService,
  firestore: Firestore,
  blockframesAdmin: boolean,
  userOrgId: string,
  config: FormatConfig
) {
  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleCache: Record<string, Movie> = {};
  const userCache: Record<string, User> = {};
  const contractCache: Record<string, Mandate | Sale> = {};
  const contracts: ContractsImportState[] = [];
  const caches = { orgNameCache, titleCache, userCache, contractCache };

  const fieldsConfig = getContractConfig(
    orgService,
    titleService,
    contractService,
    userService,
    firestore,
    blockframesAdmin,
    userOrgId,
    caches,
    config,
    ';',
  )

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 11);
  for (const result of results) {
    const { data, errors } = result;

    const contract = data.contract.type === 'mandate'
      ? createMandate(data.contract as Mandate)
      : createSale(data.contract as Sale);

    const { titleId, sellerId } = contract;
    if (titleId) {
      const movieBelongsToLicensor = await titleService.getValue(titleId).then(title => title.orgIds.includes(sellerId));
      if (!movieBelongsToLicensor) {
        errors.push({
          type: 'error',
          name: 'Wrong Licensor.',
          reason: `The movie does not belong to the licensor.`,
          message: `Please ensure the movie is a movie owned by the licensor.`
        });
      }
    }
    const terms = data.term.map(term => toTerm(term, contract.id, firestore));

    // for **internal** sales we should check the parentTerm
    const isInternalSale = contract.type === 'sale' && contract.sellerId === centralOrgId.catalog;
    if (isInternalSale) {
      if (typeof data.parentTerm === 'number') {
        const mandate = contracts[data.parentTerm - sheetHeaderLine.contracts - 1]; // first line is the column names
        contract.parentTermId = mandate?.terms[0]?.id;
        if (!mandate || !contract.parentTermId)
          errors.push({
            type: 'error',
            name: 'Wrong Mandate Row',
            reason: 'Mandate Row point to a wrong sheet line.',
            message: 'Please check that the line number is correct and that the line is a mandate.',
          });
        contract.stakeholders.concat(mandate.contract.stakeholders);
      } else {
        // here we are sure that the term exist because we already tested it above (~line 210, column o: contract.parentTerm)
        contract.parentTermId = data.parentTerm;
        // moreover the corresponding mandate is already in the contractCache so the look up should be efficient
        const mandate = await checkParentTerm(
          contract.parentTermId,
          contractService,
          contractCache
        );
        contract.stakeholders.concat(mandate.stakeholders);
      }
    }

    // remove duplicate from stakeholders
    contract.stakeholders = Array.from(new Set([...contract.stakeholders]));

    contracts.push({ contract, terms, errors, newContract: true });
  }
  return contracts;
}
