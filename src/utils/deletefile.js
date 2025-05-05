
const fs = require('fs').promises;
async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
        console.log(`File ${filePath} has been deleted.`);
    } catch (err) {
        console.error(err);
    }
}
module.exports = deleteFile