import { Controller, Post, Req, Res } from '@nestjs/common';
import sck1 from '@rsecktor/database/models/user';
import { Request, Response } from 'express';

@Controller('webhooks/yookassa')
export class YooKassaController {
  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      if (req.body.event === 'payment.succeeded') {
        const data = req.body;
        console.log(data);
        const metadata = data.object.metadata;
        if (metadata.product === 'rsc') {
          await sck1.updateOne(
            { id: metadata.buyer },
            {
              $inc: {
                'donate.rsc': data.object.amount.value,
              },
            },
          );

          const buttonMessage = {
            text: `Привет! На твой аккаунт было начислено ${metadata.sum} RSC, спасибо за проведенную оплату) ❤️`,
            contextInfo: {
              externalAdReply: {
                title: 'Events-RSecktor',
                body: 'Тут номер Разработчика, он редко отвечает, но иногда может и ответить)',
                thumbnailUrl:
                  'https://img.freepik.com/free-photo/beautiful-kitten-with-colorful-clouds_23-2150752964.jpg?t=st=1724526882~exp=1724530482~hmac=92c1b4d58e9306b19fa524ed3c09f81810c5e85b94337990e78cd41201f65e60&w=740',
                sourceUrl: `https://wa.me/19514699636`,
              },
            },
          };

          return buttonMessage;
        }
      }
      res.status(200).json({ message: 'Webhook received' });
    } catch (e) {
      console.error('Error processing webhook:', e);
      res.status(500).send('Internal Server Error');
    }
  }
}
