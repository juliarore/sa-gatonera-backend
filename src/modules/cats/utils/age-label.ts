import { AGE_LABELS } from '../constants/age-label.constants';

function getAgeInMonths(birthDate: string, now: Date): number {
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);

  let months =
    (now.getUTCFullYear() - birthYear) * 12 +
    (now.getUTCMonth() + 1 - birthMonth);
  if (now.getUTCDate() < birthDay) {
    months--;
  }

  return Math.max(months, 0);
}

/** Age of a cat in months (under a year) or years, e.g. "5 mesos" or "aprox. 3 anys". */
export function getAgeLabel(
  birthDate: string,
  isEstimated: boolean,
  now: Date = new Date(),
): string {
  const months = getAgeInMonths(birthDate, now);
  const years = Math.floor(months / 12);

  let label: string;
  if (months < 12) {
    const shownMonths = Math.max(months, 1);
    label =
      shownMonths === 1
        ? AGE_LABELS.oneMonth
        : `${shownMonths} ${AGE_LABELS.months}`;
  } else {
    label = years === 1 ? AGE_LABELS.oneYear : `${years} ${AGE_LABELS.years}`;
  }

  return isEstimated ? `${AGE_LABELS.approximate} ${label}` : label;
}
