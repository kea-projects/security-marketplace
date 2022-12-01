import * as jose from 'jose';



const SECRET: string = "PLS GET FROM ENV";

const create_token = async () => {
    const secret = new TextEncoder().encode(SECRET)
      const alg = 'HS256'
      
      const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('backend-marketplace')
        .setAudience('user')
        .setExpirationTime('1d')
        .sign(secret)
      
      console.log(jwt)
}

export { create_token }
