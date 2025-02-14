import bcrypt from "bcrypt"
import UseEmail from '~/components/emails/verification.vue'

import { render } from '@vue-email/render'
const { Hostadress } = useRuntimeConfig()

export default defineEventHandler((event) => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const request = await readBody(event)
            if (!request) return reject({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "The server could not understand the request due to invalid syntax."
            })

            const { email, wachtwoord, confirmatie } = request
            if (!email && !wachtwoord && !confirmatie) return reject({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "The server could not understand the request due to invalid syntax."
            })

            if (wachtwoord !== confirmatie) return reject({
                statusCode: 422,
                statusMessage: "Unprocessable Entity",
                message: "The request was well-formed but was unable to be followed due to semantic errors."
            })

            const available = await User.findOne({ Email: email })
            if (available) return reject({
                statusCode: 409,
                statusMessage: "Conflict",
                message: "The request could not be completed due to a conflict with the current state of the target resource."
            })

            const SessionId = crypto.randomUUID()
            await useStorage("VerifyRequired").setItem(SessionId, {
                Email: email,
                Password: bcrypt.hashSync(wachtwoord, 5),
                Username: email.split("@")[0],
            })

            const template = await render(UseEmail, {
                url: `${Hostadress}/auth/prompt/email?token=${SessionId}`,
            })

            const { error } = await useMail({
                recepient: email,
                subject: "Bevestig uw e-mailadres!",
                body: template
            })

            if (error) return reject({
                statusCode: 500,
                statusMessage: "Internal Server Error",
                message: "The server has encountered a situation it doesn't know how to handle."
            })

            setTimeout(async () => {
                await useStorage("VerifyRequired").removeItem(SessionId)
            }, 24 * 60 * 60 * 1000);

            return resolve({
                statusCode: 200,
                statusMessage: "OK",
                message: "The request has succeeded."
            })

        }, 500);
    });
})
