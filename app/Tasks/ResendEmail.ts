import BirthdayMessageLog from 'App/Models/BirthdayMessageLog'
import { BaseTask } from 'adonis5-scheduler/build'
import axios from 'axios'

export default class ResendEmail extends BaseTask {
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
		const logs = await BirthdayMessageLog.query().where('status','!=',1).preload('user')
		
		logs.forEach(async (item)=>{
			try {
				const data = await axios.post(
					'https://email-service.digitalenvision.com.au/send-email', {
						"email": item.user.email,
						"message": item.message
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
						item.merge({
							status: 1
						});
						await item.save()
					}else{
						throw "Error";
					}
			} catch (error) {
				item.merge({
					status: 3
				});
				await item.save()
			}
		})
  	}
}
