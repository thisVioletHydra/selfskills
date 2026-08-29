import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResumeEducation {
  @Field()
  level: string;

  @Field()
  school: string;

  @Field()
  details: string;
}

@ObjectType()
export class ResumeJob {
  @Field()
  id: string;

  @Field()
  period: string;

  @Field()
  duration: string;

  @Field()
  company: string;

  @Field()
  location: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  productNote?: string;

  @Field({ nullable: true })
  productExampleUrl?: string;

  @Field(() => [String])
  stack: string[];

  @Field(() => [String])
  highlights: string[];
}

@ObjectType()
export class Resume {
  @Field()
  phone: string;

  @Field()
  email: string;

  @Field()
  experienceYears: string;

  @Field(() => ResumeEducation)
  education: ResumeEducation;

  @Field(() => [String])
  skills: string[];

  @Field(() => [ResumeJob])
  jobs: ResumeJob[];
}
