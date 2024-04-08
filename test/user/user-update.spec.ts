import { INestApplication } from '@nestjs/common';
import { TestService } from '../test.service';
import { Logger } from 'winston';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { PrismaService } from '../../src/common/prisma.serivce';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
    prismaService = app.get(PrismaService);
  });

  describe('PATCH /api/v1/users/current/update', () => {
    beforeEach(async () => {
      await testService.createUser();
    });

    it('should be able to update user', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/current/update')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies)
        .send({
          username: 'newTest',
          password: 'Wazxse34',
          confirmPassword: 'Wazxse34',
          name: 'newtest',
        });

      logger.info(response.status);
      logger.debug(response.body);
      const id: string = response.body.data.id;

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();

      const getUser = await prismaService.user.findUnique({
        where: {
          id: id,
        },
      });

      const isHaveToken = await prismaService.token.count({
        where: {
          user_id: getUser.id,
        },
      });
      if (!isHaveToken) {
        await prismaService.user.deleteMany({
          where: {
            username: 'newTest',
          },
        });
      } else {
        await prismaService.token.deleteMany({
          where: {
            user_id: getUser.id,
          },
        });
        await prismaService.user.deleteMany({
          where: {
            username: 'newTest',
          },
        });
      }
    });
  });
});
