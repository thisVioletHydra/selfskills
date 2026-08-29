import type { ResumeService } from '#api/resume/resume.service';

import { Inject, NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Locale } from '#api/common/graphql/locale.enum';
import { Resume } from '#api/resume/graphql/resume.model';
import { TOKEN_RESUME_SERVICE } from '#api/resume/resume.tokens';

@Resolver(() => Resume)
export class ResumeResolver {
  constructor(@Inject(TOKEN_RESUME_SERVICE) private readonly resumeService: ResumeService) {}

  @Query(() => Resume, { name: 'resume' })
  async resume(
    @Args('locale', { type: () => Locale, defaultValue: Locale.ru }) locale: Locale
  ): Promise<Resume> {
    const resume = await this.resumeService.findOne(locale);

    if (resume === null || resume === undefined) {
      throw new NotFoundException(`Resume not found for locale "${locale}"`);
    }

    return resume;
  }
}
