import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSmsBanWordDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    word: string
}