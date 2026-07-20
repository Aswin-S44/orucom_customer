import { WEB_CLIENT_ID } from '@env';

export const BACKEND_URL = `https://api.orucom.com`; // for production
// export const BACKEND_URL = `http://10.148.210.171:5000`;
export const GOOGLE_SIGNIN_URL = `${BACKEND_URL}/api/v1/auth/signin/google`;

export const GET_ALL_SHOPS = `${BACKEND_URL}/api/v1/customer/shops`;

export const GET_ME_URL = `${BACKEND_URL}/api/v1/auth/me`;

export const CLIENT_ID =
  WEB_CLIENT_ID ||
  '268340719742-3vad3l0djfafa0f0vvaatlifpr5imm1s.apps.googleusercontent.com';
