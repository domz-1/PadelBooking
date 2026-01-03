const branchService = require('./branch.service');

const createBranch = async (req, res) => {
    try {
        const branch = await branchService.createBranch(req.body);
        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllBranches = async (req, res) => {
    try {
        const branches = await branchService.getAllBranches(req.query);
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBranchById = async (req, res) => {
    try {
        const branch = await branchService.getBranchById(req.params.id);
        if (!branch) return res.status(404).json({ message: 'Branch not found' });
        res.status(200).json(branch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBranch = async (req, res) => {
    try {
        const branch = await branchService.updateBranch(req.params.id, req.body);
        res.status(200).json(branch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBranch = async (req, res) => {
    try {
        await branchService.deleteBranch(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
};
