const generateAdminNumber = async () => {
    return Math.random().toString(36).substring(2, 12)
}

module.exports = {generateAdminNumber}
