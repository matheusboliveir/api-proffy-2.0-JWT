import db from '../../database/connection';
import { Request, Response } from 'express';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class PerfilConfig {
  async perfilConfig(request: Request, resp: Response) {
    const {
      userId,
      name,
      surname,
      email,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;
    const trx = await db.transaction();
    try {

      const user = await trx('users').where('id', '=', userId).select('id');

      if (user[0].id != userId)
        return resp.status(400).send({
          error: 'user do not exist',
        });

      await trx('users').where('id', '=', userId)
        .update({
          name,
          surname,
          avatar,
          whatsapp,
          bio,
          email
        });

      const classFilter = await trx('classes').where('user_id', '=', userId).select('id');

      if (classFilter[0]) {
        await trx('class_schedule').where('class_id', '=', classFilter[0].id).del();
        await trx('classes').where('user_id', '=', userId).del();
      }

      const class_id = await trx('classes').insert({ subject, cost, user_id: userId });

      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to)
        };
      })

      await trx('class_schedule').insert(classSchedule);
      await trx.commit();

      return resp.status(201).send();
    } catch (err) {
      await trx.rollback();
      return resp.status(400).json({
        error: 'Unexpected error while creating new class',
        err
      });
    }
  }
}
