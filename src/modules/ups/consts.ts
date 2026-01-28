export const UPS_QS_REGEX = /\((\d{1,3}\.\d{1,3})\s+(\d{1,3}\.\d{1,3})\s+(\d{1,3}\.\d{1,3})\s+(\d{1,3})\s+(\d{1,2}\.\d{1,2})\s+(\d{1,3}\.\d{1,2})\s+([0-9-]{1,3}\.[0-9-]{1,2})\s+(\d+)/i;
export const UPS_COMMANDS = ['QS', 'QWS', 'QFS', 'QBV', 'QPI', 'QMD', 'QRI', 'GM'] as const;
