export const BUCKET_NAME = process.env.BUCKET_NAME;
export const TARGET_AWS_REGION = process.env.TARGET_AWS_REGION || "us-east-1";
export const M3U_PLAYLIST_URL = process.env.M3U_PLAYLIST_URL;
export const SSM_PARAMETER_NAME =
  process.env.SSM_PARAMETER_NAME || "/m3uparser/kingiptv_url";
export const AXIOS_TIMEOUT = process.env.AXIOS_TIMEOUT
  ? +process.env.AXIOS_TIMEOUT
  : 30000;
export const M3U_FILENAME = process.env.M3U_FILENAME || "tv.m3u";
export const S3_ACL = process.env.S3_ACL || 'public-read';
export const LAMBDA_SCHEDULE = process.env.LAMBDA_SCHEDULE || 'rate(1 hour)'
