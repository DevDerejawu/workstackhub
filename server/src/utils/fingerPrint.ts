import crypto from 'crypto'
export function getDeviceFingerprint(req: Req): string {
  const userAgent = req.headers['user-agent'] || '';
  const platform = req.headers['sec-ch-platform'] || '';
  const language = req.headers['accept-language'] || '';
  const timezone = req.headers['timezone'] || '';
  
  const fingerprint = `${userAgent}|${platform}|${language}|${timezone}`;
  return crypto
    .createHash('sha256')
    .update(fingerprint)
    .digest('hex');
}
