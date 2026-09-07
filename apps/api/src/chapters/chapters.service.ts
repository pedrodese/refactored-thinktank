import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { ChapterQueryDto } from './dto/chapter-query.dto.js';
import { CreateChapterDto } from './dto/create-chapter.dto.js';
import { UpdateChapterDto } from './dto/update-chapter.dto.js';
import { Chapter } from './entities/chapter.entity.js';

@Injectable()
export class ChaptersService {
  constructor(@InjectRepository(Chapter) private readonly chaptersRepository: Repository<Chapter>) {}

  async create(dto: CreateChapterDto): Promise<Chapter> {
    const chapter = this.chaptersRepository.create(dto);
    return this.chaptersRepository.save(chapter);
  }

  async findAll(query: ChapterQueryDto): Promise<PaginatedResult<Chapter>> {
    const qb = this.chaptersRepository.createQueryBuilder('chapter').orderBy('chapter.title', 'ASC');

    if (query.q) qb.andWhere('chapter.title ILIKE :q', { q: `%${query.q}%` });
    if (query.editionYear !== undefined) qb.andWhere('chapter.edition_year = :year', { year: query.editionYear });

    const [data, total] = await qb
      .skip((query.page - 1) * query.per)
      .take(query.per)
      .getManyAndCount();

    return paginate(data, total, query.page, query.per);
  }

  async findOne(id: string): Promise<Chapter> {
    const chapter = await this.chaptersRepository.findOne({ where: { id } });
    if (!chapter) throw new NotFoundException('Capítulo não encontrado');
    return chapter;
  }

  async update(id: string, dto: UpdateChapterDto): Promise<Chapter> {
    const chapter = await this.findOne(id);
    Object.assign(chapter, dto);
    return this.chaptersRepository.save(chapter);
  }

  async remove(id: string): Promise<void> {
    const chapter = await this.findOne(id);
    try {
      await this.chaptersRepository.remove(chapter);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('Não é possível remover: este capítulo está vinculado a outros registros');
      }
      throw error;
    }
  }
}
