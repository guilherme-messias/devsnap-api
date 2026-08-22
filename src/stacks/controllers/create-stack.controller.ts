import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('stacks')
@Controller('/stacks')
export class CreateStackController {
  constructor() {}
}