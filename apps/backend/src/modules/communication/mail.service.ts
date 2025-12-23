import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  /**
   * (MOCK) Simula o envio de um e-mail de recuperação de senha.
   * O 'porquê': Em desenvolvimento e testes, não queremos disparar e-mails reais.
   * Este mock permite que toda a lógica de geração de token e fluxo de usuário seja
   * testada de ponta a ponta sem a necessidade de configurar um serviço de e-mail real.
   * O link de redefinição é logado no console para fácil acesso durante o desenvolvimento.
   * @param email O e-mail do destinatário.
   * @param token O token de redefinição de senha.
   * @param name O nome do usuário para personalizar o e-mail.
   */
  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    const resetLink = `https://app.cantapp.com/reset-password?token=${token}`;

    // Simulação do envio
    this.logger.log('--- SIMULAÇÃO DE ENVIO DE E-MAIL ---');
    this.logger.log(`Para: ${email}`);
    this.logger.log(`Assunto: Redefinição de Senha - CantApp`);
    this.logger.log(`Olá ${name},`);
    this.logger.log(
      `Clique no link a seguir para redefinir sua senha: ${resetLink}`,
    );
    this.logger.log('------------------------------------');

    // Em uma implementação real, o código para enviar o e-mail estaria aqui.
    // ex: await this.transporter.sendMail(...)

    return Promise.resolve();
  }
}
