import { AgeGroup } from '../enums';

export const KITTEN_MAX_MONTHS = 12;
export const YOUNG_MAX_MONTHS = 24;
export const ADULT_MAX_MONTHS = 7 * 12;

export interface BirthDateRange {
  /** El gat ha de néixer estrictament després d'aquesta data (YYYY-MM-DD). */
  after?: string;
  /** El gat ha de néixer en aquesta data o abans (YYYY-MM-DD). */
  onOrBefore?: string;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Data de fa `months` mesos respecte a `now`, ajustant el dia si el mes destí és més curt. */
function monthsAgo(months: number, now: Date): string {
  const lastDayOfTargetMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 0),
  ).getUTCDate();
  return toIsoDate(
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - months,
        Math.min(now.getUTCDate(), lastDayOfTargetMonth),
      ),
    ),
  );
}

/** Rang de birth_date que correspon a cada grup d'edat. */
export function getBirthDateRange(
  group: AgeGroup,
  now: Date = new Date(),
): BirthDateRange {
  const kittenLimit = monthsAgo(KITTEN_MAX_MONTHS, now);
  const youngLimit = monthsAgo(YOUNG_MAX_MONTHS, now);
  const adultLimit = monthsAgo(ADULT_MAX_MONTHS, now);

  switch (group) {
    case AgeGroup.KITTEN:
      return { after: kittenLimit };
    case AgeGroup.YOUNG:
      return { after: youngLimit, onOrBefore: kittenLimit };
    case AgeGroup.ADULT:
      return { after: adultLimit, onOrBefore: youngLimit };
    case AgeGroup.SENIOR:
      return { onOrBefore: adultLimit };
  }
}

/** Grup d'edat d'un gat a partir de la seva data de naixement (YYYY-MM-DD). */
export function getAgeGroup(birthDate: string, now: Date = new Date()): AgeGroup {
  const isInRange = ({ after, onOrBefore }: BirthDateRange) =>
    (after === undefined || birthDate > after) &&
    (onOrBefore === undefined || birthDate <= onOrBefore);

  return (
    Object.values(AgeGroup).find((group) =>
      isInRange(getBirthDateRange(group, now)),
    ) ?? AgeGroup.SENIOR
  );
}
