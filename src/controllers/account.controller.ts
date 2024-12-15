import envConfig from '@/config';
import { PrismaErrorCode } from '@/constants/error-reference';
import prisma from '@/database';
import { selectAccountDto, type ChangePassword, type CreateEmployee, type UpdateEmployee, type UpdateMe } from '@/schemaValidations/account.schema';
import type { MakeOptional } from '@/types/utils.type';
import { comparePassword, hashPassword } from '@/utils/crypto';
import { EntityError, isPrismaClientKnownRequestError } from '@/utils/errors';
import { getChalk } from '@/utils/helpers';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { Role } from '@prisma/client';

class AccountController {
  /**
   * @description Initialize owner account
   * @buihuytuyen
   */
  initOwnerAccount = async () => {
    const accountCount = await prisma.account.count();
    if (accountCount === 0) {
      const hashedPassword = await hashPassword(envConfig.INITIAL_PASSWORD_OWNER);
      await prisma.account.create({
        data: {
          name: 'Owner',
          email: envConfig.INITIAL_EMAIL_OWNER,
          phone: '0368239728',
          password: hashedPassword,
          role: Role.Owner
        }
      });
      const chalk = await getChalk();
      console.log(chalk.bgCyan(`Khởi tạo tài khoản chủ quán thành công: ${envConfig.INITIAL_EMAIL_OWNER}|${envConfig.INITIAL_PASSWORD_OWNER}`));
    }
  };

  /**
   * @description Create employee account
   * @param body
   * @returns
   * @buihuytuyen
   */
  createEmployee = async (body: CreateEmployee) => {
    try {
      const hashedPassword = await hashPassword(body.password);
      const account = await prisma.account.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          role: Role.Employee,
          avatar: body.avatar
        },
        select: selectAccountDto
      });
      return account;
    } catch (error: any) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.UniqueConstraintViolation) {
          throw new EntityError([{ field: 'email', message: 'Email đã tồn tại' }]);
        }
      }
      throw error;
    }
  };

  /**
   * @description Get employee accounts
   * @returns
   * @buihuytuyen
   */
  getEmployees = async () => {
    const accounts = await prisma.account.findMany({
      where: {
        role: Role.Employee
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: selectAccountDto
    });
    return accounts;
  };

  /**
   * @description Get employee account
   * @param accountId
   * @returns
   * @buihuytuyen
   */
  getEmployee = async (accountId: string) => {
    const account = await prisma.account.findUniqueOrThrow({
      where: {
        id: accountId
      },
      select: selectAccountDto
    });
    return account;
  };

  /**
   * @description Get account list
   * @returns
   * @buihuytuyen
   */
  getAccounts = async () => {
    const account = await prisma.account.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: selectAccountDto
    });
    return account;
  };

  /**
   * @description Update employee account
   * @param accountId
   * @param body
   * @returns
   * @buihuytuyen
   */
  updateEmployee = async ({ id, ...body }: UpdateEmployee) => {
    try {
      const [socketRecord, oldAccount] = await Promise.all([
        prisma.socket.findUnique({
          where: {
            accountId: id
          }
        }),
        prisma.account.findUnique({
          where: {
            id
          }
        })
      ]);

      if (!oldAccount) {
        throw new EntityError([{ field: 'email', message: 'Tài khoản bạn đang cập nhật không còn tồn tại nữa!' }]);
      }

      const data: MakeOptional<Omit<UpdateEmployee, 'id'>, 'role'> = {
        name: body.name,
        email: body.email,
        avatar: body.avatar,
        phone: body.phone
      };

      const isChangeRole = oldAccount.role !== body.role;
      if (isChangeRole) {
        data.role = body.role;
      }

      if (body.changePassword) {
        data.password = await hashPassword(body.password!);
      }

      const account = await prisma.account.update({
        where: {
          id
        },
        data,
        select: selectAccountDto
      });

      return {
        account,
        socketId: socketRecord?.socketId,
        isChangeRole
      };
    } catch (error: any) {
      if (isPrismaClientKnownRequestError(error)) {
        if (error.code === PrismaErrorCode.UniqueConstraintViolation) {
          throw new EntityError([{ field: 'email', message: 'Email đã tồn tại' }]);
        }
      }
      throw error;
    }
  };

  /**
   * @description Delete employee account
   * @param accountId
   * @returns
   * @buihuytuyen
   */
  deleteEmployee = async (accountId: string) => {
    const socketRecord = await prisma.socket.findUnique({
      where: {
        accountId
      }
    });
    const account = await prisma.account.delete({
      where: {
        id: accountId
      },
      select: selectAccountDto
    });
    return {
      account,
      socketId: socketRecord?.socketId
    };
  };

  /**
   * @description Get me
   * @param accountId
   * @returns
   * @buihuytuyen
   */
  getMe = async (accountId: string) => {
    const account = prisma.account.findUniqueOrThrow({
      where: {
        id: accountId
      },
      select: selectAccountDto
    });
    return account;
  };

  /**
   * @description Update me
   * @param accountId
   * @param body
   * @returns
   * @buihuytuyen
   */
  updateMe = async (accountId: string, body: UpdateMe) => {
    const account = prisma.account.update({
      where: {
        id: accountId
      },
      data: body,
      select: selectAccountDto
    });
    return account;
  };

  /**
   * @description Change password
   * @param accountId
   * @param body
   * @returns
   * @buihuytuyen
   */
  changePassword = async (accountId: string, body: ChangePassword) => {
    const account = await prisma.account.findUniqueOrThrow({
      where: {
        id: accountId
      }
    });
    const isSame = await comparePassword(body.oldPassword, account.password);
    if (!isSame) {
      throw new EntityError([{ field: 'oldPassword', message: 'Mật khẩu cũ không đúng' }]);
    }
    const hashedPassword = await hashPassword(body.password);
    const newAccount = await prisma.account.update({
      where: {
        id: accountId
      },
      data: {
        password: hashedPassword
      },
      select: selectAccountDto
    });
    return newAccount;
  };

  /**
   * @description Change password v2
   * @param accountId
   * @param body
   * @returns
   * @buihuytuyen
   */
  changePasswordV2 = async (accountId: string, body: ChangePassword) => {
    const account = await this.changePassword(accountId, body);
    await prisma.refreshToken.deleteMany({
      where: {
        accountId
      }
    });
    const accessToken = signAccessToken({
      userId: account.id,
      role: account.role
    });
    const refreshToken = signRefreshToken({
      userId: account.id,
      role: account.role
    });
    const decodedRefreshToken = verifyRefreshToken(refreshToken);
    const expiresAt = new Date(decodedRefreshToken.exp * 1000);
    await prisma.refreshToken.create({
      data: {
        accountId: account.id,
        token: refreshToken,
        expiresAt
      }
    });
    return {
      account,
      accessToken,
      refreshToken
    };
  };
}

export default new AccountController();
