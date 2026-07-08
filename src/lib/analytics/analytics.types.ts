export interface BaseAnalyticsInput {
    projectId: string;
    skipValidation?: boolean;
}

export interface CalculateUptimePercentageInput extends BaseAnalyticsInput {}
export interface CalculateAverageResponseTimeInput extends BaseAnalyticsInput {}
export interface GetRecentFailuresInput extends BaseAnalyticsInput {}
export interface GetPingHistoryInput extends BaseAnalyticsInput {}