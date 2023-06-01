import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class UserController {
  public async store({request, response}) {
    const validator = schema.create({
        first_name: schema.string(),
        last_name: schema.string(),
        email: schema.string({}, [
            rules.email()
        ]),
        dob: schema.date(),
        timezone: schema.string(),
    })

    const payload = await request.validate({ schema: validator })

    const user = await User.create({
        firstName: payload.first_name,
        lastName: payload.last_name,
        email: payload.email,
        dob: payload.dob,
        timezone: payload.timezone,
      })

      if(user){
        return response.status(200).send({"code": "20000", "message": "OK", "data": user})
      }

      return response.status(400).send({"code": "40000", "message": "Server busy"})
  }

  public async update({request, response}) {
    const validator = schema.create({
        first_name: schema.string(),
        last_name: schema.string(),
        email: schema.string({}, [
            rules.email()
        ]),
        dob: schema.date(),
        timezone: schema.string(),
    })

    const payload = await request.validate({ schema: validator })

    const user = await User.find(request.param('id'));

    if(!user){
      return response.status(400).send({"code": "40000", "message": "User not found"}).status(400)
    }

    if(user){
        user.merge({
            firstName: payload.first_name,
            lastName: payload.last_name,
            email: payload.email,
            dob: payload.dob,
            timezone: payload.timezone,
          })
          
        user.save()
        return response.status(200).send({"code": "20000", "message": "OK", "data": user})
      }
      
      return response.status(400).send({"code": "40000", "message": "Server busy"})
  }

  public async delete({request, response}) {
    const user = await User.find(request.param('id'));

    if(!user){
        return response.status(400).send({"code": "40000", "message": "User not found"})
    }

    if(user){
        await user.delete()
          
        return response.status(200).send({"code": "20000", "message": "OK"})
      }
      
      return response.status(400).send({"code": "40000", "message": "Server busy"})
  }
}