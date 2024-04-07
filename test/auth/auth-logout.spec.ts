import { INestApplication } from '@nestjs/common';
import { TestService } from '../test.service';
import { Logger } from 'winston';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
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

  describe('GET /api/v1/auth/logout', () => {
    beforeEach(async () => {
      await testService.createUser();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be able to logout', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${signIn.body.data.token}`)
        .set('Cookie', signIn.get('Set-Cookie'));

      logger.debug(response.body);
      logger.info(response.status);
      logger.debug(response.get('Set-Cookie'));
    });
  });
});
