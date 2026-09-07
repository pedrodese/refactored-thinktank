import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';
import { isForeignKeyViolation } from '../common/utils/database-error.util.js';
import { paginate, type PaginatedResult } from '../common/dto/paginated-result.js';
import { CreateToolEventAssessmentDto } from './dto/create-tool-event-assessment.dto.js';
import { ToolEventAssessmentQueryDto } from './dto/tool-event-assessment-query.dto.js';
import { UpdateToolEventAssessmentDto } from './dto/update-tool-event-assessment.dto.js';
import { TOOL_ASSESSMENT_COMMENT_REQUIRED_SCORES, ToolAssessmentScore } from './enums/tool-assessment-score.enum.js';
import { ToolEventAssessment } from './entities/tool-event-assessment.entity.js';

const RELATIONS = ['tool'];

@Injectable()
export class ToolEventAssessmentsService {
  constructor(
    @InjectRepository(ToolEventAssessment)
    private readonly assessmentsRepository: Repository<ToolEventAssessment>,
  ) {}

  // Diferente de Event: aqui o comentário é sempre exigido quando o score é
  // pessimo/ruim, não só em update (validates do Rails são incondicionais).
  private assertCommentRequired(score: ToolAssessmentScore, comment: string): void {
    if (TOOL_ASSESSMENT_COMMENT_REQUIRED_SCORES.includes(score) && !comment) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { comment: ['deve ser preenchido quando a avaliação é péssima ou ruim'] },
      });
    }
  }

  private async save(assessment: ToolEventAssessment): Promise<ToolEventAssessment> {
    try {
      return await this.assessmentsRepository.save(assessment);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { toolId: ['ferramenta informada não existe'] },
        });
      }
      throw error;
    }
  }

  async create(eventId: string, dto: CreateToolEventAssessmentDto): Promise<ToolEventAssessment> {
    const comment = dto.comment ?? '';
    this.assertCommentRequired(dto.score, comment);

    const assessment = this.assessmentsRepository.create({ eventId, toolId: dto.toolId, score: dto.score, comment });
    const saved = await this.save(assessment);
    return this.findOne(eventId, saved.id);
  }

  async findAll(eventId: string, query: ToolEventAssessmentQueryDto): Promise<PaginatedResult<ToolEventAssessment>> {
    const where: FindOptionsWhere<ToolEventAssessment> = { eventId };
    if (query.toolId) where.toolId = query.toolId;

    const [data, total] = await this.assessmentsRepository.findAndCount({
      where,
      relations: RELATIONS,
      order: { id: 'ASC' },
      skip: (query.page - 1) * query.per,
      take: query.per,
    });

    return paginate(data, total, query.page, query.per);
  }

  async findOne(eventId: string, id: string): Promise<ToolEventAssessment> {
    const assessment = await this.assessmentsRepository.findOne({ where: { id, eventId }, relations: RELATIONS });
    if (!assessment) throw new NotFoundException('Avaliação de ferramenta não encontrada');
    return assessment;
  }

  async update(eventId: string, id: string, dto: UpdateToolEventAssessmentDto): Promise<ToolEventAssessment> {
    const assessment = await this.findOne(eventId, id);
    const score = dto.score ?? assessment.score;
    const comment = dto.comment ?? assessment.comment;
    this.assertCommentRequired(score, comment);

    assessment.toolId = dto.toolId ?? assessment.toolId;
    assessment.score = score;
    assessment.comment = comment;

    await this.save(assessment);
    return this.findOne(eventId, id);
  }

  async remove(eventId: string, id: string): Promise<void> {
    const assessment = await this.findOne(eventId, id);
    await this.assessmentsRepository.remove(assessment);
  }
}
