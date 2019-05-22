import express from 'express';

const router = express.Router();

router.route('/')
    .get(async (req, res) => {
        try {
            res.status(200).send({a: "hui"});
        } catch (err) {
            res.status(500).send(err);
        }
    });
router.route('/get')
    .get(async (req, res) => {
        try {
            res.status(200).send({a: "suka"});
        } catch (err) {
            res.status(500).send(err);
        }
    });

export default router;
