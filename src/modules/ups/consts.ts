export const UPS_QS_REGEX = /^\((?<iv>\d{1,3}(?:\.\d{1,2})?)\s+(\d{1,3}(?:\.\d{1,2})?)\s+(?<ov>\d{1,3}(?:\.\d{1,2})?)\s+0?(?<load>\d{1,3})\s+(?<freq>\d{1,2}(?:\.\d{1,2})?)\s+(?<bt>\d{1,2}(?:\.\d{1,2})?)\s+((?:\d{1,3}|-{1,3})(?:\.(?:\d{1,2}|-{1,2}))?)\s+(\d{8})/i;
export const UPS_COMMANDS = ['QS', 'QWS', 'QFS', 'QBV', 'QPI', 'QMD', 'QRI', 'GM'] as const;
