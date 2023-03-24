export const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
export const AWS_REGION = import.meta.env.VITE_AWS_REGION;
export const AWS_SIGN_ALGORITHM = 'AWS4-HMAC-SHA256';
export const AWS_SERVICE_NAME = 'iottwinmaker';
export const DOMAIN_API = `api.iottwinmaker.${AWS_REGION}.amazonaws.com`;
