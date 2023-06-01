import Database from '@ioc:Adonis/Lucid/Database'
import BirthdayMessageLog from 'App/Models/BirthdayMessageLog'
import MessageTemplate from 'App/Models/MessageTemplate'
import User from 'App/Models/User'
import { BaseTask } from 'adonis5-scheduler/build'
import axios from 'axios'
import moment from 'moment-timezone'

export default class SendEmail extends BaseTask {
	public static get schedule() {
		return '* * * * * *'
	}
	/**
	 * Set enable use .lock file for block run retry task
	 * Lock file save to `build/tmpTaskLock`
	 */
	public static get useLock() {
		return false
	}

	public async handle() {
		const users = await User
		.query()
		.orderBy("timezone")

		users.forEach(async (user) => {
			const now = moment.tz(user.timezone)			
			const check = await Database.from("birthday_message_logs")
			.where('user_id', user.id)
			.whereRaw('YEAR(created_at) = ?', [now.year()])
			.first()
			if(check){
				return
			}

			const sendOn = moment(`${now.year()}-${user.dob.month}-${user.dob.day} 09:00:00`, 'YYYY-MM-DD HH:mm:ss').tz(user.timezone)
			if(now.isSameOrAfter(sendOn)){

				const template = await MessageTemplate.findBy("label", "BIRTHDAY")
				let message = template?.message.replace('{full_name}', `${user.firstName} ${user.lastName}`)

				const logMsg = await BirthdayMessageLog.create({
					userId: user.id,
					message: message,
					status: 0
				})

				try {
					const data = await axios.post(
						'https://email-service.digitalenvision.com.au/send-email', {
							"email": user.email,
							"message": message
						},
						{
						  headers: {
							Accept: 'application/json',
						  },
						},
					  );
					  console.log(data.status);
					  console.log(data.data);
						if(data.status == 200){
							logMsg.merge({
								status: 1
							});
							await logMsg.save()
						}else{
							throw "Error";
						}
				} catch (error) {
					logMsg.merge({
						status: 3
					});
					await logMsg.save()
				}
			}
		});
  	}
}
