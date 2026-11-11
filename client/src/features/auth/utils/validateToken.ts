export function isValidToken(token:string) {
  const hex64Regex = /^[0-9a-fA-F]{64}$/;
  return hex64Regex.test(token);
}