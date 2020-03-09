const express = require('express');

const router = express.Router();
const auth = require('../middleware/auth');

const { Pool, Client } = require('pg');
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

router.get('/dashboard', async (req, res) => {
    try {
        const { year, month, mall } = req.query;
        let text = '';
        let values = [];
        if (!year || !month) {
            text = 'SELECT COUNT(DISTINCT CONCAT("MacAddr",\':\',"InputTime"::timestamp::date)) ' +
                'FROM public."TR_AccessLogs" where "InputTime"::timestamp::date = NOW()::timestamp::date ' +
                'and "MallName" like $1;';
            values = [mall]
        } else {
            text = 'SELECT COUNT(DISTINCT CONCAT("MacAddr",\':\',"InputTime"::timestamp::date))\n' +
                '\tFROM public."TR_AccessLogs" where EXTRACT(year from "InputTime")=$1\n' +
                '\tand EXTRACT(month from "InputTime")=$2 and "MallName" like $3;';
            values = [year, month, mall];
        }
        const result = await pool.query(text, values);
        res.status(200).send({data: result.rows})
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/guest-connections', async (req, res) => {
    try {
        const { mall } = req.query;
        let text = 'SELECT COUNT(DISTINCT CONCAT("MacAddr",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where\n' +
            '\t"InputTime"::timestamp::date = NOW()::timestamp::date\n' +
            '\tand "VerificationId" is null and "MallName" like $1;\n';
        const values = [mall];
        const result = await pool.query(text, values);
        res.status(200).send({data: result.rows})
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/member-connections', async (req, res) => {
    try {
        const { mall } = req.query;
        let text = 'SELECT COUNT(DISTINCT CONCAT("MacAddr",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where\n' +
            '\t"InputTime"::timestamp::date = NOW()::timestamp::date\n' +
            '\tand "VerificationId" is not null and "MallName" like $1;\n';
        const values = [mall];
        const result = await pool.query(text, values);
        res.status(200).send({data: result.rows})
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/one-month', async (req, res) => {
    try {
        const { year, month, mall } = req.query;
        let text = 'SELECT "InputTime"::timestamp::date accessDate,\n' +
            '\tto_char("InputTime"::timestamp::date, \'dd/mm/yyyy\') accessDate2,\n' +
            '\tto_char("InputTime"::timestamp::date, \'day\') dayname,\n' +
            '\tCOUNT(DISTINCT CONCAT("MacAddr",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where EXTRACT(year from "InputTime")=$1\n' +
            '\tand EXTRACT(month from "InputTime")=$2 and "MallName" like $3 GROUP BY(accessDate);\n';
        const values = [year, month, mall];
        const result = await pool.query(text, values);
        res.status(200).send({data: result.rows});
    } catch(error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/one-month/byWeek', async (req, res) => {
    try {
        const { year, month, mall } = req.query;
        let text = 'SELECT date_part(\'week\', "InputTime"::date) accessWeek,\n' +
            '\tto_char(MIN("InputTime"::date), \'dd/mm/yyyy\') firstDate,\n' +
            '\tto_char(MAX("InputTime"::date), \'dd/mm/yyyy\') lastDate,\n' +
            '\tCOUNT(DISTINCT CONCAT("MacAddr",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where EXTRACT(year from "InputTime")=$1\n' +
            '\tand EXTRACT(month from "InputTime")=$2 and "MallName" like $3 GROUP BY(accessWeek);\n';
        const values = [year, month, mall];
        const result = await pool.query(text, values);
        res.status(200).send({data: result.rows});
    } catch(error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

module.exports = router;
