/**
 * Example : "Steven[separator] Kostanski" 
 * @param str 
 * @param separator 
 */
export function formatCredit(str: string, separator: string = '\\s+'): any {
  const credit = {
    firstName: '',
    lastName: '',
  }

  if (str.split(new RegExp(separator)).length > 1) {
    credit.firstName = str.split(new RegExp(separator))[0];
    credit.lastName = str.split(new RegExp(separator))[1];
  } else {
    credit.lastName = str.split(new RegExp(separator))[0];
  }

  return credit;
}

/**
 * Example : "Quentin[subSeparator] Dupieux[separator] Steven[subSeparator] Kostanski"
 * @param str 
 * @param separator 
 * @param subSeparator 
 */
export function formatCredits(str: string, separator: string = ',', subSeparator: string = '\\s+'): any[] {
  const credits = [];
  str.split(separator).forEach((a: string) => {
    credits.push(formatCredit(a.trim(), subSeparator));
  });

  return credits;
}