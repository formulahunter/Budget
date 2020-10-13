const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

//  serve the budget landing page for GET requests to top-level /budget directory
// app.get
//  query mysql database for records
app.get('/data', async (req, res) => {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'node',
            password: '',
            database: 'budget',
            timezone: 'Z',
        });
    }
    catch(er) {
        console.error(`error connecting to the database: ${er.stack}`);
        res.writeHead(500);
        res.end();

        if(conn && conn.end) {
            conn.end();
        }
        return;
    }

    //  query data from tables listed above
    //  set http status code 500 upon caught error
    //  close db connection
    let data;
    try {
        //  initiate database queries for all types
        //  note that accounts are procured as complete records
        data = {
            realAccounts: conn.query('SELECT * FROM AbstractAccounts JOIN RealAccounts USING (id)'),
            virtualAccounts: conn.query('SELECT * FROM AbstractAccounts JOIN VirtualAccounts USING (id)'),
            activities: conn.query('SELECT * FROM Activities'),
            categories: conn.query('SELECT * FROM Categories'),
            sources: conn.query('SELECT * FROM Sources'),
        };

        //  map resolved promises back to their corresponding keys on 'data'
        const entries = Object.entries(data);
        (await Promise.all(entries.map(ent => ent[1])))
            .map(res => res[0])     //  conn.query() returns an array of [results, fields]
            .forEach((res, ind) => {data[entries[ind][0]] = res});
    }
    catch(er) {
        console.error(`error querying the database: ${er.message}`);
        console.trace();
        res.writeHead(500);
    }
    finally {
        if(conn && conn.end) {
            conn.end();
        }
    }

    res.end(JSON.stringify(data));
});
app.use(express.static(path.resolve(__dirname, 'dist'), {index: 'index.html'}));


module.exports = app;
