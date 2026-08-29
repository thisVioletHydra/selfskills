import { Module } from '@nestjs/common';
import { ResumeResolver } from '#api/resume/resume.resolver';
import { ResumeService } from '#api/resume/resume.service';
import { TOKEN_RESUME_SERVICE } from '#api/resume/resume.tokens';

@Module({
  providers: [
    ResumeService,
    { provide: TOKEN_RESUME_SERVICE, useExisting: ResumeService },
    ResumeResolver,
  ],
})
export class ResumeModule {}
