// Formato HH:MM (24h). clusters.start_time/end_time são `time` no Postgres;
// a API só aceita/expõe hora e minuto, sem segundos, igual o accessor
// `strftime('%H:%M')` de app/models/cluster.rb.
export const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
