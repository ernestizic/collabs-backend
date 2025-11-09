import { MemberRole } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class InviteMemberDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsInt()
  projectId: number;

  @IsEnum(MemberRole)
  @IsNotEmpty()
  role: MemberRole;
}

export class UpdateMemberDto {
  @IsNotEmpty()
  @IsInt()
  projectId: number;

  @IsEnum(MemberRole)
  @IsNotEmpty()
  role: MemberRole;
}
