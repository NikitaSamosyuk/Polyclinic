import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CabinetsService } from './cabinets.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('cabinets')
export class CabinetsController {
  constructor(private readonly service: CabinetsService) {}

  @Public()
  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Public()
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(Number(id));
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }
}
