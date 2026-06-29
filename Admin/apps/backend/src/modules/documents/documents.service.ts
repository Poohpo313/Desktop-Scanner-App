import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DocumentEntity } from "./entities/document.entity";

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity, "online")
    private readonly documents: Repository<DocumentEntity>
  ) {}

  searchOcr(query: string, userId?: number) {
    const qb = this.documents
      .createQueryBuilder("d")
      .where("d.is_deleted = FALSE")
      .andWhere(
        `to_tsvector('english', coalesce(d.ocr_text, '')) @@ plainto_tsquery('english', :query)`,
        { query }
      )
      .orderBy("d.upload_date", "DESC")
      .limit(50);

    if (userId) qb.andWhere("d.uploaded_by = :userId", { userId });
    return qb.getMany();
  }
}
