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

  describe('DELETE /api/v1/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await testService.createAddress();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be able to remove address', async () => {
      const signIn = await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          username: 'test',
          password: 'testtesttest',
        });

      const token = signIn.body.data.token;
      const cookies = signIn.get('Set-Cookie');
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      logger.info(contact.id);
      logger.info(address.id);
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact.id}/addresses/${address.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies);

      logger.info(response.status);
      logger.debug(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
