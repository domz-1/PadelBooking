require('dotenv').config();
const { sequelize } = require('./config/database');
const Sponsor = require('./modules/sponsors/sponsor.model');

async function testSponsors() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync Sponsor model
        await Sponsor.sync();

        // 1. Create Sponsor
        const sponsorData = {
            name: 'Test Sponsor',
            image: 'http://example.com/image.png',
            link: 'http://example.com',
            isActive: true
        };

        const sponsor = await Sponsor.create(sponsorData);
        console.log('Sponsor created:', sponsor.id);

        // 2. Read Sponsor
        const fetchedSponsor = await Sponsor.findByPk(sponsor.id);
        if (fetchedSponsor && fetchedSponsor.name === 'Test Sponsor') {
            console.log('✅ Sponsor read verified.');
        } else {
            console.error('❌ Sponsor read failed.');
        }

        // 3. Update Sponsor
        await sponsor.update({ name: 'Updated Sponsor' });
        const updatedSponsor = await Sponsor.findByPk(sponsor.id);
        if (updatedSponsor.name === 'Updated Sponsor') {
            console.log('✅ Sponsor update verified.');
        } else {
            console.error('❌ Sponsor update failed.');
        }

        // 4. Delete Sponsor
        await sponsor.destroy();
        const deletedSponsor = await Sponsor.findByPk(sponsor.id);
        if (!deletedSponsor) {
            console.log('✅ Sponsor delete verified.');
        } else {
            console.error('❌ Sponsor delete failed.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
}

testSponsors();
