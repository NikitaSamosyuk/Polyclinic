"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const prisma_service_1 = require("./prisma/prisma.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const redis_module_1 = require("./redis/redis.module");
const patients_module_1 = require("./patients/patients.module");
const doctors_module_1 = require("./doctors/doctors.module");
const appointments_module_1 = require("./appointments/appointments.module");
const visits_module_1 = require("./visits/visits.module");
const admin_module_1 = require("./admin/admin.module");
const cabinets_module_1 = require("./cabinets/cabinets.module");
let AppModule = class AppModule {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onApplicationBootstrap() {
        try {
            const count = await this.prisma.user.count();
            console.log('--- ✅ PRISMA ПРОВЕРКА УСПЕШНА ---');
            console.log(`Пользователей в базе: ${count}`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('--- ❌ ОШИБКА PRISMA ---', msg);
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            redis_module_1.RedisModule,
            patients_module_1.PatientsModule,
            doctors_module_1.DoctorsModule,
            appointments_module_1.AppointmentsModule,
            visits_module_1.VisitsModule,
            admin_module_1.AdminModule,
            cabinets_module_1.CabinetsModule,
        ],
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppModule);
//# sourceMappingURL=app.module.js.map