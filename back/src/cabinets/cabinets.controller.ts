import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CabinetsService } from './cabinets.service';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';

@Controller('cabinets')
export class CabinetsController {
  constructor(private cabinets: CabinetsService) {}

  @Get()
  async getAll() {
    return this.cabinets.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.cabinets.getById(Number(id));
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateCabinetDto) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can create cabinets');
    }

    return this.cabinets.create(dto);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCabinetDto,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can update cabinets');
    }

    return this.cabinets.update(Number(id), dto);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can delete cabinets');
    }

    return this.cabinets.delete(Number(id));
  }
}
