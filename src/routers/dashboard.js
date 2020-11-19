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
        const { year, month, mall, isYesterday } = req.query;
        let text = '';
        let values = [];
        if (!year || !month) {
            let dateToCmp = 'NOW()::timestamp::date ';
            if (isYesterday && isYesterday === '1') {
                dateToCmp = dateToCmp + " - interval '1 day' ";
            }
            text = 'SELECT COUNT(DISTINCT CONCAT("LoginName",\':\',"InputTime"::timestamp::date)) ' +
                'FROM public."TR_AccessLogs" where "InputTime"::timestamp::date = '+ dateToCmp +
                'and "MallName" like $1;';
            values = [mall]
        } else {
            text = 'SELECT COUNT(DISTINCT CONCAT("LoginName",\':\',"InputTime"::timestamp::date))\n' +
                '\tFROM public."TR_AccessLogs" where EXTRACT(year from "InputTime")=$1\n' +
                '\tand EXTRACT(month from "InputTime")=$2 and "MallName" like $3;';
            values = [year, month, mall];
        }
        const result = await pool.query(text, values);
        res.status(200).send(result.rows)
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/bar', async (req, res) => {
    try {
        const { mall, isYesterday } = req.query;
        let text = '';
        let values = [];
        let dateToCmp = 'NOW()::timestamp::date ';
        if (isYesterday && isYesterday === '1') {
            dateToCmp = dateToCmp + " - interval '1 day' ";
        }
        text = 'SELECT TO_CHAR(date_trunc(\'hour\', "InputTime"), \'hh12AM\') datehour, COUNT(DISTINCT CONCAT("LoginName",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where "InputTime"::timestamp::date = ' + dateToCmp + ' \n' +
            '\tand "MallName" like $1 and "InputTime"::time between \'10:00:00\' AND \'22:59:00\'\n' +
            '\tgroup by "InputTime"::timestamp::date, date_trunc(\'hour\', "InputTime");';
        values = [mall];

        const result = await pool.query(text, values);
        res.status(200).send(result.rows)
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/guest-connections', async (req, res) => {
    try {
        const { mall, isYesterday } = req.query;
        let dateToCmp = 'NOW()::timestamp::date ';
        if (isYesterday && isYesterday === '1') {
            dateToCmp = dateToCmp + " - interval '1 day' ";
        }
        let text = 'SELECT COUNT(DISTINCT CONCAT("LoginName",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where\n' +
            '\t"InputTime"::timestamp::date = ' + dateToCmp + ' \n' +
            '\tand "VerificationId" is null and "MallName" like $1;\n';
        const values = [mall];
        const result = await pool.query(text, values);
        res.status(200).send(result.rows)
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/guest-connections/bar', async (req, res) => {
    try {
        const { mall, isYesterday } = req.query;
        let text = '';
        let values = [];
        let dateToCmp = 'NOW()::timestamp::date ';
        if (isYesterday && isYesterday === '1') {
            dateToCmp = dateToCmp + " - interval '1 day' ";
        }
        text = 'SELECT TO_CHAR(date_trunc(\'hour\', "InputTime"), \'hh12AM\') datehour, COUNT(DISTINCT CONCAT("LoginName",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where "InputTime"::timestamp::date = ' + dateToCmp + ' \n' +
            '\tand "MallName" like $1 and "InputTime"::time between \'10:00:00\' AND \'22:59:00\' and "VerificationId" is null\n' +
            '\tgroup by "InputTime"::timestamp::date, date_trunc(\'hour\', "InputTime");';
        values = [mall];

        const result = await pool.query(text, values);
        res.status(200).send(result.rows)
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/member-connections', async (req, res) => {
    try {
        const { mall, isYesterday } = req.query;
        let dateToCmp = 'NOW()::timestamp::date ';
        if (isYesterday && isYesterday === '1') {
            dateToCmp = dateToCmp + " - interval '1 day' ";
        }
        let text = 'SELECT COUNT(DISTINCT CONCAT("LoginName",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where\n' +
            '\t"InputTime"::timestamp::date = ' + dateToCmp + ' \n' +
            '\tand "VerificationId" is not null and "MallName" like $1;\n';
        const values = [mall];
        const result = await pool.query(text, values);
        res.status(200).send(result.rows)
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/member-connections/bar', async (req, res) => {
    try {
        const { mall, isYesterday } = req.query;
        let text = '';
        let values = [];
        let dateToCmp = 'NOW()::timestamp::date ';
        if (isYesterday && isYesterday === '1') {
            dateToCmp = dateToCmp + " - interval '1 day' ";
        }
        text = 'SELECT TO_CHAR(date_trunc(\'hour\', "InputTime"), \'hh12AM\') datehour, COUNT(DISTINCT CONCAT("LoginName",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where "InputTime"::timestamp::date = ' + dateToCmp + ' \n' +
            '\tand "MallName" like $1 and "InputTime"::time between \'10:00:00\' AND \'22:59:00\' and "VerificationId" is not null\n' +
            '\tgroup by "InputTime"::timestamp::date, date_trunc(\'hour\', "InputTime");';
        values = [mall];

        const result = await pool.query(text, values);
        res.status(200).send(result.rows)
    }  catch (error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/one-month', async (req, res) => {
    try {
        const { year, month, mall } = req.query;
        let text = 'SELECT "InputTime"::timestamp::date accessDate,\n' +
            '\tto_char("InputTime"::timestamp::date, \'dd/mm/yy\') accessDate2,\n' +
            '\tto_char("InputTime"::timestamp::date, \'Dy\') dayname,\n' +
            '\tCOUNT(DISTINCT CONCAT("MacAddr",\':\',"InputTime"::timestamp::date))\n' +
            '\tFROM public."TR_AccessLogs" where EXTRACT(year from "InputTime")=$1\n' +
            '\tand EXTRACT(month from "InputTime")=$2 and "MallName" like $3 GROUP BY(accessDate);\n';
        const values = [year, month, mall];
        const result = await pool.query(text, values);
        res.status(200).send(result.rows);
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
        res.status(200).send(result.rows);
    } catch(error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/get-mall-names', async (req, res) => {
    try {
        let text = 'SELECT distinct "MallName",ROW_NUMBER() OVER (ORDER BY "MallName") as id\n' +
            '  FROM public."TR_AccessLogs" where "MallName" != \'\' GROUP BY "MallName";';
        const result = await pool.query(text);
        res.status(200).send(result.rows);
    } catch(error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/get-member-logs', async (req, res) => {
    try {
        const { mall } = req.query;
        let text = 'SELECT ROW_NUMBER() OVER (ORDER BY "LoginName") as no, "Id", "LoginName", "OriginIP", "MacAddr", "MallName"\n' +
            '  FROM public."TR_AccessLogs" where "InputTime"::timestamp::date = NOW()::timestamp::date and "VerificationId" ' +
            'is not null and ("MallName" = \'\' or "MallName" is null or "MallName" like $1) ORDER BY "LoginName" LIMIT 500;';
        let values = [mall];
        const result = await pool.query(text, values);
        res.status(200).send(result.rows);
    } catch(error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

router.get('/dashboard/update-mall', async (req, res) => {
    try {
        const { ipAddress } = req.query;
        let text = 'SELECT DISTINCT "MallName"\n' +
            '  FROM public."TR_AccessLogs" where "MallName" is not null and "MallName" != \'\' ' +
            'and "OriginIP" like $1 LIMIT 1;';
        let values = [ipAddress];
        const result = await pool.query(text, values);
        if (result.rows.length > 0) {
            let mallName = result.rows[0]['MallName'];
            let text2 = 'UPDATE public."TR_AccessLogs" set "MallName" = $1 where ("MallName" is null or "MallName" = \'\') ' +
                'and "OriginIP" like $2';
            let values2 = [mallName, ipAddress];
            await pool.query(text2, values2);
        }

        res.status(200).send(result.rows);
    } catch(error) {
        await pool.end();
        res.status(400).send({error: error.message})
    }
});

module.exports = router;
