import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common'
import { CabinetsService } from './cabinets.service'
import { CreateCabinetDto } from './dto/create-cabinet.dto'
import { UpdateCabinetDto } from './dto/update-cabinet.dto'
import { Request } from 'express'

interface AuthRequest extends Request {
  user?: {
    sub: number
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
    iat?: number
    exp?: number
  }
}

@Controller('cabinets')
export class CabinetsController {
  constructor(private readonly cabinets: CabinetsService) {}

  @Get()
  async getAll() {
    return this.cabinets.getAll({
      include: {
        doctors: true,
        shifts: {
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        },
      },
    })
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.cabinets.getById(Number(id), {
      include: {
        doctors: true,
        shifts: {
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        },
      },
    })
  }

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateCabinetDto) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для создания кабинета')
    }

    return this.cabinets.create(dto)
  }

  @Patch(':id')
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCabinetDto,
  ) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для изменения кабинета')
    }

    return this.cabinets.update(Number(id), dto)
  }

  @Delete(':id')
  async deactivate(@Req() req: AuthRequest, @Param('id') id: string) {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для деактивации кабинета')
    }

    return this.cabinets.deactivate(Number(id))
  }
}
