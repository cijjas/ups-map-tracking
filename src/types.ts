export type RoutePoint = {
  rawLocation: string;
  label: string;
  lat: number;
  lon: number;
  date?: string;
  time?: string;
  timestamp?: string;
  status?: string;
  isCurrent?: boolean;
};

export type ParsedActivity = {
  rawLocation: string;
  date?: string;
  time?: string;
  timestamp?: string;
  status?: string;
  isCurrent?: boolean;
};

export type UpsMilestone = {
  isCurrent?: boolean;
  isCompleted?: boolean;
  isFuture?: boolean;
  date?: string;
  time?: string;
  location?: string;
  name?: string;
};

export type UpsActivity = {
  date?: string;
  time?: string;
  location?: string;
  activityScan?: string;
  gmtDate?: string;
  gmtTime?: string;
  gmtOffset?: string;
  milestoneName?: { name?: string } | null;
};

export type UpsTrackDetail = {
  shipmentProgressActivities?: UpsActivity[] | null;
  milestones?: UpsMilestone[] | null;
  currentMilestone?: UpsMilestone | null;
};

export type UpsTrackPayload = {
  trackDetails?: UpsTrackDetail[];
};

export const INTERCEPT_MESSAGE_SOURCE = 'UPS_ROUTE_MAP_INTERCEPT';

export type InterceptMessage = {
  source: typeof INTERCEPT_MESSAGE_SOURCE;
  payload: UpsTrackPayload;
  url: string;
};
