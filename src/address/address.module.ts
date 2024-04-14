import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [ContactModule],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
