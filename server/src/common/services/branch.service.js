const Branch = require('../../api/modules/branches/branch.model');
const Venue = require('../../api/modules/venues/venue.model');

const createBranch = async (data) => {
    return await Branch.create(data);
};

const getAllBranches = async (query = {}) => {
    const { isActive } = query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    return await Branch.findAll({
        where,
        include: [{
            model: Venue,
            as: 'Venues'
        }],
        order: [['createdAt', 'DESC']]
    });
};

const getBranchById = async (id) => {
    return await Branch.findByPk(id, {
        include: [{
            model: Venue,
            as: 'Venues'
        }]
    });
};

const updateBranch = async (id, data) => {
    const branch = await Branch.findByPk(id);
    if (!branch) throw new Error('Branch not found');
    return await branch.update(data);
};

const deleteBranch = async (id) => {
    const branch = await Branch.findByPk(id);
    if (!branch) throw new Error('Branch not found');
    return await branch.destroy();
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
};
