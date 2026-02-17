const { createClient } = require('redis');
require('dotenv').config();
const Redishclient = createClient({
    username: 'default',
    password:process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port:process.env.REDIS_PORT
    }
});
module.exports=Redishclient;