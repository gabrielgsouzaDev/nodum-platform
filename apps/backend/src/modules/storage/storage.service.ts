import { Injectable, Logger } from '@nestjs/common';
// FIX: Import Buffer type to resolve 'Cannot find name 'Buffer'' error.
import { Buffer } from 'buffer';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  /**
   * (MOCK) Simula o upload de um arquivo para um serviço de armazenamento em nuvem (ex: AWS S3, Cloudinary).
   * O 'porquê': Abstrair a lógica de upload de arquivos em um serviço dedicado segue o
   * Princípio da Responsabilidade Única. Este mock permite o desenvolvimento e teste
   * de funcionalidades que dependem de upload (como a importação de alunos) sem a
   * necessidade de configurar e provisionar um bucket de armazenamento real, agilizando o
   * desenvolvimento local.
   * @param fileBuffer O buffer do arquivo a ser salvo.
   * @param fileName O nome original do arquivo.
   * @returns Uma promessa que resolve com a URL pública do arquivo simulado.
   */
  async uploadFile(
    // O tipo 'Buffer' está disponível globalmente no Node.js
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ url: string }> {
    const uniqueFileName = `${Date.now()}-${fileName}`;

    this.logger.log(
      `(MOCK) Salvando arquivo '${uniqueFileName}' de ${fileBuffer.length} bytes.`,
    );

    // Em uma implementação real, aqui ocorreria a chamada para o SDK do S3, Cloudinary, etc.
    // Ex: await this.s3.upload({ Bucket, Key, Body }).promise();

    const mockUrl = `https://fake-storage.cantapp.com/images/${uniqueFileName}`;

    return Promise.resolve({ url: mockUrl });
  }
}
