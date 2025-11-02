import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InviteMemberDto } from './dto/members-dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { DecodedInviteInformation } from './types/members.types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllProjectMembers(projectId: number, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [members, membersCount] = await Promise.all([
      this.prisma.collaborator.findMany({
        where: { projectId },
        take: limit,
        skip,
      }),
      this.prisma.collaborator.count({
        where: { projectId },
      }),
    ]);

    return {
      members,
      pagination: {
        total: membersCount,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(membersCount / limit),
      },
    };
  }

  async sendInviteToUser(
    userId: number,
    payload: InviteMemberDto,
  ): Promise<string> {
    const [user, project] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: payload.email } }),
      this.prisma.project.findUnique({
        where: { id: payload.projectId },
      }),
    ]);
    if (!project) throw new BadRequestException('Project not found');
    // Ensure only the owner of the project can invite other users
    if (project.ownerId !== userId)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    if (user) {
      const isMemberExist = await this.prisma.collaborator.findUnique({
        where: {
          userId_projectId: { userId: user?.id, projectId: project.id },
        },
      });
      if (isMemberExist)
        throw new ForbiddenException('A member with this email exists');
    }

    const inviteData = {
      ...payload,
    };

    const token = await this.jwtService.signAsync(inviteData, {
      expiresIn: '7d',
    });
    // send mail
    this.mailService.sendInviteMail(payload.email, token).catch((err) => {
      this.logger.error(err);
    });

    return 'Email sent!';
  }

  async acceptInvite(token: string, userId: number) {
    try {
      const inviteData: DecodedInviteInformation =
        await this.jwtService.verifyAsync(token);

      const [project, user] = await Promise.all([
        this.prisma.project.findUnique({
          where: { id: inviteData.projectId },
          include: { collaborators: { include: { user: true } } },
        }),
        this.prisma.user.findUnique({
          where: { email: inviteData.email },
        }),
      ]);
      if (!project)
        throw new BadRequestException(
          'Project does not exist. Please contact the project owner',
        );
      if (!user) throw new BadRequestException('This user does not exist');

      // Ensure the authenticated user is the one accepting the invite
      if (userId !== user.id)
        throw new ForbiddenException(
          "You're not allowed to perform this action",
        );

      const isExistingMember = await this.prisma.collaborator.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: project.id,
          },
        },
      });
      if (isExistingMember)
        throw new BadRequestException(
          'You are already a member of this project',
        );

      const newMember = await this.prisma.collaborator.create({
        data: { projectId: project.id, userId: user.id },
      });

      this.eventEmitter.emit('invite.accepted', {
        projectId: project.id,
        member: newMember,
      });

      return newMember;
    } catch (error) {
      const errorName = (error as Error)?.name;
      this.logger.error(error);

      if (errorName === 'TokenExpiredError') {
        throw new BadRequestException('The invitation link has expired');
      } else if (errorName === 'JsonWebTokenError') {
        throw new BadRequestException('The invitation token is invalid');
      }

      throw new BadRequestException('This token is invalid or expired');
    }
  }
}
