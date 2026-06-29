import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentEntity } from "./entities/document.entity";
import { DocumentsService } from "./documents.service";

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity], "online")],
  providers: [DocumentsService],
  exports: [DocumentsService]
})
export class DocumentsModule {}
