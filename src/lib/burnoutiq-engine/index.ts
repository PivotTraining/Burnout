/**
 * BurnoutIQ Scoring Engine — Public API
 *
 * @example
 * ```ts
 * import { scoreIndividual, assessRisk, aggregateOrganization } from "burnoutiq-engine";
 *
 * // Score one respondent
 * const report = scoreIndividual("emp_001", responses, completionSeconds);
 * const risk = assessRisk(report);
 *
 * // Aggregate org-wide
 * const orgReadout = aggregateOrganization(records, { invitedCount: 200 });
 * ```
 */

export {
  DIMENSIONS,
  ITEMS,
  FREQUENCY_LABELS,
  SCALE_MIN,
  SCALE_MAX,
} from "./instrument";

export type {
  Dimension,
  DimensionId,
  DimensionCategory,
  InstrumentItem,
} from "./instrument";

export { scoreIndividual } from "./scoring";

export type {
  ResponseSet,
  ScoreLevel,
  DimensionScore,
  IndividualScoreReport,
} from "./scoring";

export { assessRisk, PROFILE_LABELS } from "./risk";

export type { BurnoutProfile, RiskAssessment } from "./risk";

export {
  aggregateOrganization,
  MIN_GROUP_SIZE_FOR_REPORTING,
} from "./aggregation";

export type {
  RespondentRecord,
  DimensionAggregate,
  ProfileDistribution,
  DepartmentReadout,
  OrganizationalReadout,
  AggregationOptions,
} from "./aggregation";
