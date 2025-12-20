export interface DayFieldErrors {
  open?: string;
  close?: string;
}

export type ValidationErrors = Record<string, DayFieldErrors>;

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DayScheduleFormData {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ScheduleDayPayload {
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
}
export interface SchedulePayload {
  monday: ScheduleDayPayload;
  tuesday: ScheduleDayPayload;
  wednesday: ScheduleDayPayload;
  thursday: ScheduleDayPayload;
  friday: ScheduleDayPayload;
  saturday: ScheduleDayPayload;
  sunday: ScheduleDayPayload;
  timezone: string;
}
