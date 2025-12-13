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
