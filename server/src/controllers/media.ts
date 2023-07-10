// TS treats modules as scripts without this dummy import
import {} from './index'

const getFile = async (req, res) => {
    res.sendFile(req.params.file, {root: `./src/media/${req.params.section}`}, (err) => {
        if (err) {
            return console.log('file was not sent: ', err);
        }
        // console.log('file was sent');
    });
};
module.exports = {getFile};