import { Module } from '@nestjs/common';
import { ProfileResolver } from '#api/profile/profile.resolver';
import { ProfileService } from '#api/profile/profile.service';
import { TOKEN_PROFILE_SERVICE } from '#api/profile/profile.tokens';

@Module({
  providers: [
    ProfileService,
    { provide: TOKEN_PROFILE_SERVICE, useExisting: ProfileService },
    ProfileResolver,
  ],
})
export class ProfileModule {}
