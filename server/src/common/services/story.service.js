const Story = require('../../api/modules/stories/story.model');
const User = require('../../api/modules/users/user.model');
const { Op } = require('sequelize');

class StoryService {
    async createStory(userId, data) {
        // Set expiration to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return await Story.create({ ...data, userId, expiresAt });
    }

    async getActiveStories() {
        return await Story.findAll({
            where: {
                expiresAt: {
                    [Op.gt]: new Date()
                }
            },
            include: [
                { model: User, attributes: ['name', 'image'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async deleteStory(id) {
        const story = await Story.findByPk(id);
        if (!story) return null;
        return await story.destroy();
    }
}

module.exports = new StoryService();
