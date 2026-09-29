/**
 * Prisma User stores the document URL as `aadhaarUrl` and admin approval as `verified`.
 * There is no `aadhaarVerified` column — passing it makes `user.update` throw and
 * drops the URL, so ID verification never reaches the admin queue.
 */
export const aadhaarProfilePatch = (url: string) => ({ aadhaarUrl: url });
