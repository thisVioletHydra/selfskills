import type { ProfileService } from '#api/profile/profile.service';

import { Inject, NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Locale } from '#api/common/graphql/locale.enum';
import { Profile } from '#api/profile/graphql/profile.model';
import { TOKEN_PROFILE_SERVICE } from '#api/profile/profile.tokens';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(@Inject(TOKEN_PROFILE_SERVICE) private readonly profileService: ProfileService) {}

  @Query(() => Profile, { name: 'profile' })
  async profile(
    @Args('locale', { type: () => Locale, defaultValue: Locale.ru }) locale: Locale
  ): Promise<Profile> {
    const profile = await this.profileService.findOne(locale);

    if (profile === null) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
