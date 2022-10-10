import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './ormconfig';
import { TagModule } from '@app/tag/tag.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), TagModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
