const request = require('request');
const express = require('express')
const jwt = require('jsonwebtoken')
const Users = require('../model/Users')


function authMidleware(req, res, next){
    if(req.path === '/fight/engine' && req.method === 'PUT' ){
        next()
    }
    
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({
            Error: "Token Não Enviado"
        })
    }

    const options = {
        method: 'GET',
        url: process.env.URL_CONNECTION_KEY_CLOAK,
        headers: {
          Authorization: authorization
        },
    };
    
    request(options, (error, response, body) => {
        if(error){
            return res.status(401).json({
                Error: error
            })
        }

        if(response.statusCode !== 200){
            return res.status(401).json({
                Error: "Não Autorizado"
            })
        }else{
            const parts = authorization.split(' ')
            const [bearer, token] = parts
            
            req.user = jwt.decode(token)
            saveUser(req.user)

            next()
        }
    })    
}

async function saveUser(userData){
    const {sub, name, preferred_username, email} = userData

    try{
        const newUser = await Users.findOrCreate({
            where: { id: sub },
            defaults: {
                id: sub,
                name, 
                email,
                userName: preferred_username
            }
        })
    }catch(err){
        console.log(err)
    }
}
module.exports = authMidleware