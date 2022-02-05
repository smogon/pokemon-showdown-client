import { VercelRequest, VercelResponse, VercelApiHandler } from '@vercel/node';

export const allowCors = (handler: VercelApiHandler) => async (request: VercelRequest, response: VercelResponse) => {
    response.setHeader('Access-Control-Allow-Credentials', "true")
    response.setHeader('Access-Control-Allow-Origin', '*')
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (request.method === 'OPTIONS') {
        response.status(200).end()
        return
    }
    return await handler(request, response)
}
