import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAxisDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
