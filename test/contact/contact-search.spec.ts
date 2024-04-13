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

  describe('GET /api/v1/contacts', () => {
    beforeEach(async () => {
      await testService.createContactMany();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be able to query existing contact', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies);

      logger.info(response.status);
      logger.debug(response.body.data);
      logger.debug(response.body.paging.size);
      logger.debug(response.body.paging.total_page);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.current_page).toBe(1);
    });

    it('should be able to search contact with param variable', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies)
        .query({
          name: 'fuma',
        });
      logger.info(response.status);
      logger.debug(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should be able to query existing contact with param page', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies)
        .query({
          page: 2,
        });
      logger.info(response.status);
      logger.debug(response.body);
      logger.debug(response.body.paging.size);
      logger.debug(response.body.paging.total_page);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.paging).toBeDefined();
    });
  });
});
