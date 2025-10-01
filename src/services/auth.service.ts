import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto, LoginDto, UpdateProfileDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const { email, password, name, avatar_url } = registerDto;

    // Verificar se o usuário já existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const user = this.userRepository.create({
      email,
      password_hash: passwordHash,
      name,
      avatar_url,
    });

    const savedUser = await this.userRepository.save(user);

    // Gerar token JWT
    const token = this.jwtService.sign({ 
      sub: savedUser.id, 
      email: savedUser.email 
    });

    // Retornar usuário sem senha
    const { password_hash, ...userWithoutPassword } = savedUser;
    return { user: userWithoutPassword, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email 
    });

    // Retornar usuário sem senha
    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Atualizar campos
    if (updateProfileDto.name) {
      user.name = updateProfileDto.name;
    }
    if (updateProfileDto.avatar_url !== undefined) {
      user.avatar_url = updateProfileDto.avatar_url;
    }

    const updatedUser = await this.userRepository.save(user);

    // Retornar usuário sem senha
    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async validateUser(userId: number): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
