import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from '../test.service';
import { TestModule } from '../test.module';

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

  describe('POST /api/v1/auth/sign-up', () => {
    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should reject sign-up if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send({
          username: '',
          password: 'test',
          name: '',
        });

      logger.error(response.body.errors);
      logger.info(response.status);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    it('should be able to sign-up', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send({
          username: 'test',
          password: 'testtesttest',
          name: 'test',
        });

      logger.debug(response.body.data);
      logger.info(response.status);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should reject if username is already taken', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/sign-up').send({
        username: 'test',
        password: 'testtesttest',
        name: 'test',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send({
          username: 'test',
          password: 'testtesttest',
          name: 'test',
        });

      logger.error(response.body.errors);
      logger.info(response.status);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
