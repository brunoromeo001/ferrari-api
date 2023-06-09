/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ca } from 'date-fns/locale';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService
  ) {};

  async getToken(userId: number){

    const { email, photo, id, person} = await this.userService.get(userId);
    const { name } = person;

    return this.jwtService.sign({
      name,
      email,
      photo,
      id
    });

  }

  async login({email, password}: {email: string, password: string}){

    const user = await this.userService.getByEmail(email);

    await this.userService.checkPassword(user.id, password);

    const token = await this.getToken(user.id)

    return {
      token
    }
  }

  async decodeToken(token: string){

    try {

      await this.jwtService.verify(token)

    }catch (e){

      throw new UnauthorizedException(e.message)
    }

    return this.jwtService.decode(token)
  }

  async recovery(email: string){

    const { id, person } = await this.userService.getByEmail(email);
    const { name } = person;

    const token = await this.jwtService.sign({ id }, {
      expiresIn: 30 * 60
    });

    await this.prisma.passwordRecovery.create({
      data: {
        userId: id,
        token
      }
    })

    await this.mailService.send({
      to: 'brunogfvot@hotmail.com',
      subject: 'Esqueci a senha',
      template: 'forget',
      data:{
        name,
        url: `https://linkdeacesso.web.html?token=${token}`
      }
    })

    return { succes: true}
  }

  async reset({
    password,
    token,
  }: {
    password: string;
    token: string;
  }){

    if(!password){
      throw new BadRequestException("Password is required");
    }

    try{

      await this.jwtService.verify(token);

    } catch (e){
      throw new BadRequestException(e.message)
    }

    const passwordRecovery = await this.prisma.passwordRecovery.findFirst({
      where: {
        token,
        resetAt: null
      }
    })

    if(!passwordRecovery){
      throw new BadRequestException("Token used")
    }

    await this.prisma.passwordRecovery.update({
      where: {
        id: passwordRecovery.id
      },
      data:{
        resetAt: new Date()
      }
    })

    return this.userService.updatePassword(passwordRecovery.userId, password);
  }

}
