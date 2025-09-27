import { MemberRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class InviteMemberDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsInt()
  projectId: number;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;
}
