import { SHA256, HmacSHA256 } from 'crypto-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  AWS_SERVICE_NAME,
  AWS_SIGN_ALGORITHM,
  DOMAIN_API,
} from './constants';
dayjs.extend(utc);

// Implement AWS signature v4 for API calls
// https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html

// Create timestamp UTC
function getDateTime() {
  return dayjs.utc().format('YYYYMMDDTHHmmss[Z]'); // Example: 20210301T120000Z
}

// Create signature
const getSignatureKey = (key: string, dateStamp: string, regionName = AWS_REGION, serviceName = AWS_SERVICE_NAME) => {
  const kDate = HmacSHA256(dateStamp, 'AWS4' + key);
  const kRegion = HmacSHA256(regionName, kDate);
  const kService = HmacSHA256(serviceName, kRegion);
  const kSigning = HmacSHA256('aws4_request', kService);
  return kSigning;
};

export const fetchWithAuth = async (path: string, method = 'POST') => {
  const timestamp = getDateTime();

  // Step 1: Create a canonical request
  const canonicalQueryString = '';
  const canonicalHeaders = `host:${DOMAIN_API}\nx-amz-date:` + timestamp + '\n';
  const signedHeaders = 'host;x-amz-date';
  const dateStamp = timestamp.substr(0, 8);
  const credentialScope = `${dateStamp}/${AWS_REGION}/${AWS_SERVICE_NAME}/aws4_request`;
  const payloadHash = SHA256('').toString();
  const canonicalRequest = `${method}\n${path}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Step 3: Create a string to sign
  const stringToSign = `${AWS_SIGN_ALGORITHM}\n${timestamp}\n${credentialScope}\n${SHA256(canonicalRequest)}`;

  // Step 4: Calculate the signature
  const key = getSignatureKey(AWS_SECRET_ACCESS_KEY, dateStamp);
  const signature = HmacSHA256(stringToSign, key);

  // Step 5: Add the signature to the request
  const Authorization = `${AWS_SIGN_ALGORITHM} Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const requestOptions: any = {
    method,
    headers: {
      'X-Amz-Date': timestamp,
      Authorization,
    },
    redirect: 'follow',
  };

  // Fetch the list of factories
  return fetch(`https://${DOMAIN_API}${path}`, requestOptions)
    .then((response) => response.text()) // Convert the response to text
    .then((result) => JSON.parse(result)) // Convert the text to JSON
    .catch((error) => console.log('error', error));
};
