import bcrypt from "bcrypt";
import connection from "../database/db.js";
import { v4 as uuid } from "uuid";

export async function signIn(req, res) {
    const user = res.locals.user;
    console.log(user.id)
    const token = uuid();

    try {
        const userSessionExist = await connection.query(`SELECT * from sessions where "userId" = $1`, [user.id])
        console.log(userSessionExist.rows[0])
        
        if (userSessionExist.rows[0] === undefined) {
          await connection.query(`INSERT INTO sessions ("userId", token) VALUES ($1, $2);`, [user.id, token]) 
          
        } else {
            await connection.query(`UPDATE sessions SET token=$1 WHERE "userId"=$2;`, [token, user.id])
        }
        const imageUser =  (await connection.query(`SELECT "pictureUrl" FROM users WHERE id=$1;`,[user.id])).rows[0].pictureUrl
        res.status(200).send({ token,imageUser })

    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
}

export async function signUp(req, res) {
    const { name, email, password, pictureUrl } = res.locals.user;

    const passwordHash = bcrypt.hashSync(password, 10);

    try {
        await connection.query(`INSERT INTO users (name, email,senha,"pictureUrl") VALUES ($1, $2, $3, $4);`, [name, email, passwordHash, pictureUrl]);
        res.sendStatus(201);

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}