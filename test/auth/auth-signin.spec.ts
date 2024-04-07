import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { TestService } from '../test.service';
import { Logger } from 'winston';
import * as request from 'supertest';

describe('AuthController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/v1/auth/sign-in', () => {
    beforeEach(async () => {
      await testService.createUser();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be able to sign in', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      logger.debug(response.body);
      logger.debug(response.get('Set-Cookie'));
      logger.info(response.status);

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.get('Set-Cookie')).toBeDefined();
    });

    it('should reject sign in if credentials is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'test',
        });

      logger.error(response.body.errors);
      logger.info(response.status);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
  });
});
