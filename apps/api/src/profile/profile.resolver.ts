import type { ProfileService } from '#api/profile/profile.service';

import { Profile } from '#api/profile/graphql/profile.model';
import { TOKEN_PROFILE_SERVICE } from '#api/profile/profile.tokens';
import { Inject, NotFoundException } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    @Inject(TOKEN_PROFILE_SERVICE) private readonly profileService: ProfileService
  ) {}

  @Query(() => Profile, { name: 'profile' })
  async profile(): Promise<Profile> {
    const profile = await this.profileService.findOne();

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
