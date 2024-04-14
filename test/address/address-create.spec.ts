import { INestApplication } from '@nestjs/common';
import { TestService } from '../test.service';
import { Logger } from 'winston';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';

describe('AddressController', () => {
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

  describe('POST /api/v1/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be able to create new address', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');
      const contact = await testService.getContact();
      logger.info(contact.id);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/contacts/${contact.id}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies)
        .send({
          street: 'test street',
          city: 'test city',
          province: 'test province',
          country: 'test country',
          postal_code: '51161',
        });
      logger.info(response.status);
      logger.debug(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject to create new address if contact id is invalid', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');
      const contact = await testService.getContact();
      logger.info(contact.id);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/contacts/${contact.id}1/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies)
        .send({
          street: 'test street',
          city: 'test city',
          province: 'test province',
          country: 'test country',
          postal_code: '51161',
        });
      logger.info(response.status);
      logger.debug(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });
});
