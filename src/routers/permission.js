const express = require('express');
const Permission = require('../models/Permission');
const UserDetail = require('../models/UserDetail');

const router = express.Router();
const auth = require('../middleware/auth');

router.post('/permissions', async (req, res) => {
	try {
	    const permission = new Permission(req.body);
	    await permission.save();
	    res.status(201).send({permission})
	}  catch (error) {
	    res.status(400).send({error: error.message})
	}
});

router.get('/permissions', async (req, res) => {
	try {
		const permissions = await Permission.getAll();
		res.status(200).send({permissions})
	}  catch (error) {
		res.status(400).send({error: error.message})
	}
});

router.post('/permissions/delete', auth, async (req, res) => {
	try {
		const { name } = req.body;
		const permission = await Permission.findByName(name);

		const userDetail = UserDetail.findByUser(req.user.id);
		if (!userDetail || userDetail.userName !== 'admin') {
			return res.status(401).send({error: 'Not authorized to access this resource'})
		}

		if (!permission) {
			return res.status(500).send({error: 'Permission not found'})
		}

		await permission.delete();
		res.send({permission})
	}  catch (error) {
		res.status(400).send({error: error.message})
	}
});

router.post('/permissions/getByName', async(req, res) => {
	try {
	    const { name } = req.body;
        const permission = await Permission.findByName(name);
        if (!permission) {
            return res.status(500).send({error: 'Permission not found'})
        }
        res.send({ permission })
	} catch(error) {
		res.status(500).send({error: 'Internal Error'})
	}
});

module.exports = router;
