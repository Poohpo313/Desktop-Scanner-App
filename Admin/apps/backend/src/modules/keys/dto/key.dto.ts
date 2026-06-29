import { IsInt, Max, Min } from "class-validator";

export class AssignKeyDto {
  @IsInt()
  serialId!: number;

  @IsInt()
  userId!: number;
}

export class BulkGenerateDto {
  @IsInt()
  @Min(1)
  @Max(100)
  count!: number;
}
