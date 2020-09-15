import db from '../../database/connection';
import { Request, Response } from 'express';
import convertHourToMinutes from '../utils/convertHourToMinutes';

export default class ShareController {

  async index(request: Request, resp: Response) {
    const filters = request.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if(!filters.week_day || !filters.subject || !filters.time) {
      return resp.status(400).json({
        error: 'Missing filters to search classes'
      });
    }

    const timeInMinutes = convertHourToMinutes(time);

    const classes = await db('classes')
    .whereExists(function() {
      this.select('class_schedule.*')
      .from('class_schedule')
      .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
      .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
      .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
      .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
    })
    .where('classes.subject','=', subject)
    .join('users','classes.user_id', '=', 'users.id')
    .select(['classes.*','users.*']);

    return resp.json(classes);

  }
  
}
