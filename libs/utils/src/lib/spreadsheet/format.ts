import { createCredit } from "../common-interfaces/identity";
import { getCodeIfExists, ExtractCode } from "../static-model/staticModels";

/**
 * Example : "Steven[separator] Kostanski[separator] filmography|role"
 * @param str
 * @param separator
 * @param thirdItemType
 */
export function formatCredit(str: string, separator: string = '\\s+', thirdItemType: string = 'filmography'): any {
  const credit = createCredit();

  if (str.split(new RegExp(separator)).length > 1) {
    credit.firstName = str.split(new RegExp(separator))[0].trim();
    credit.lastName = str.split(new RegExp(separator))[1].trim();
  } else {
    credit.lastName = str.split(new RegExp(separator))[0].trim();
  }

  if (str.split(new RegExp(separator)).length > 2) {
    if (thirdItemType === 'filmography') {
      credit.filmography = str.split(new RegExp(separator))[2].trim();
    } else {
      const roleName = str.split(new RegExp(separator))[2];
      let role;
      switch (thirdItemType) {
        case 'PRODUCER_ROLES':
          role = getCodeIfExists(thirdItemType, roleName as ExtractCode<'PRODUCER_ROLES'>);
          break;
        case 'CAST_ROLES':
          role = getCodeIfExists(thirdItemType, roleName as ExtractCode<'CAST_ROLES'>);
          break;
        case 'CREW_ROLES':
          role = getCodeIfExists(thirdItemType, roleName as ExtractCode<'CREW_ROLES'>);
          break;
        default:
          break;
      }
      if (role) { credit.role = role }
    }
  }

  return credit;
}

/**
 * Example : "Quentin[subSeparator] Dupieux[separator] Steven[subSeparator] Kostanski"
 * @param str
 * @param separator
 * @param subSeparator
 * @param thirdItemType
 */
export function formatCredits(
  str: string,
  separator: string = ',',
  subSeparator: string = '\\s+',
  thirdItemType: string = 'filmography'
): any[] {
  const credits = [];
  str.split(separator).forEach((a: string) => {
    credits.push(formatCredit(a.trim(), subSeparator, thirdItemType));
  });

  return credits;
}
