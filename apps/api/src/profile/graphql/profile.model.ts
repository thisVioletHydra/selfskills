import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfileFact {
  @Field()
  label: string;

  @Field()
  value: string;
}

@ObjectType()
export class Profile {
  @Field()
  name: string;

  @Field()
  role: string;

  @Field()
  tag: string;

  @Field()
  blurb: string;

  @Field()
  portrait: string;

  @Field(() => [ProfileFact])
  facts: ProfileFact[];

  @Field(() => [String])
  goals: string[];

  @Field(() => [String])
  about: string[];
}
