import { INestApplication } from '@nestjs/common';
import { TestService } from '../test.service';
import { Logger } from 'winston';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';

describe('ContactController', () => {
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

  describe('GET /api/v1/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be able get contacts', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies);

      logger.info(response.status);
      logger.debug(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
