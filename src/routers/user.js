const express = require('express');
const User = require('../models/User');
const UserDetail = require('../models/UserDetail');

const router = express.Router();
const auth = require('../middleware/auth');

router.post('/users', async (req, res) => {
	try {
	    const user = new User(req.body);
	    await user.save();
	    const token = await user.generateAuthToken();
	    res.status(201).send({user, token})
	}  catch (error) {
	    res.status(400).send({error: error.message})
	}
});

router.post('/users/login', async(req, res) => {
	try {
	    const { email, password } = req.body;
        let user = await User.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken();
        res.send({ user, token })
	} catch(error) {
	    res.status(400).send({error: error.message})
	}
});

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
});

router.post('/users/me', auth, async(req, res) => {
    try {
        const user = new User(req.body);
        if (user.email === req.user.email) {
            let userNew = await User.updateByEmail(req.body.email.trim(), user);
            res.status(204).send({user: userNew, message: 'Updated successfully!'})
        } else {
            res.status(500);
        }
    }  catch (error) {
        res.status(400).send({error: error.message})
    }
});

router.get('/users/detail', auth, async(req, res) => {
    // View logged in user profile
    try {
        let userDetail;
        if (req.query.username) {
            userDetail = await UserDetail.findByUserName(req.query.username);
        } else {
            userDetail = await UserDetail.findByUser(req.user.id);
            userDetail.email = req.user.email
        }
        if (!userDetail) {
            return res.status(400).send({error: 'Invalid user'})
        }

        res.send(userDetail)
    } catch (error) {
        res.status(500).send({error: error.message})
    }
});

router.post('/users/detail', auth, async (req, res) => {
    try {
        let userDetail;
        let userDetailOld = UserDetail.findByUser(req.user.id);
        if (!userDetailOld) {
            userDetail = new UserDetail(req.body);
            await userDetail.save();
            if (req.body.email) {
                userDetail.user = await User.findByEmail(req.body.email.trim());
                await userDetail.save()
            }

            if (userDetail.userName === '' || !userDetail.userName) {
                const userName = await userDetail.generateUserName();
            }
            res.status(201).send(userDetail);
        } else {
            userDetail = await UserDetail.updateByUser(req.user.id, new UserDetail(req.body));
            res.status(200).send(userDetail);
        }
    }  catch (error) {
        res.status(400).send({error: error.message})
    }
});

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        });
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send({error: error.message})
    }
});

router.post('/users/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send({error: error.message})
    }
});

module.exports = router;
