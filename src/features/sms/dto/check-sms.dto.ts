import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CheckSmsDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    text: string
}