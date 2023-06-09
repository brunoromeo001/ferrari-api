import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServicesModule } from './services/services.module';
import { ContactsModule } from './contacts/contacts.module';
import { TimeOptionsService } from './time-options/time-options.service';
import { TimeOptionsController } from './time-options/time-options.controller';
import { TimeOptionsModule } from './time-options/time-options.module';
import { AddressesModule } from './addresses/addresses.module';


@Module({
  imports: [
    MailModule,
    AuthModule,
    UserModule,
    PrismaModule,
    ServicesModule,
    ContactsModule,
    TimeOptionsModule,
    AddressesModule
  ],
  controllers: [AppController, TimeOptionsController],
  providers: [TimeOptionsService],
  exports: [ServicesModule],
})
export class AppModule { }
