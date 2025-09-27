import { MemberRole } from '@prisma/client';

export interface DecodedInviteInformation {
  email: string;
  projectId: number;
  role?: MemberRole;
  iat: number;
  exp: number;
}
