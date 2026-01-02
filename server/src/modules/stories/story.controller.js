const storyService = require('./story.service');

exports.getStories = async (req, res, next) => {
    try {
        const stories = await storyService.getActiveStories();
        res.status(200).json({ success: true, data: stories });
    } catch (error) {
        next(error);
    }
};

exports.createStory = async (req, res, next) => {
    try {
        const story = await storyService.createStory(req.user.id, req.body);
        res.status(201).json({ success: true, data: story, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.deleteStory = async (req, res, next) => {
    try {
        const story = await storyService.deleteStory(req.params.id);
        if (!story) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
