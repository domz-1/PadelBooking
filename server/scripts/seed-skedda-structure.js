const { sequelize } = require('../src/config/database');
const Branch = require('../src/modules/branches/branch.model');
const Venue = require('../src/modules/venues/venue.model');

const cleanName = (name) => {
    // Remove emojis and extra spaces for cleaner internal names
    return name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF])/g, '').trim();
};

const seedStructure = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const structure = {
            "Ring Road": [
                { name: "Court 1", skeddaId: "1080512" },
                { name: "Solo Padel", skeddaId: "1080513" },
                { name: "Court 2", skeddaId: "1250704" }
            ],
            "El Giesh St": [
                { name: "Court 1", skeddaId: "1321586" },
                { name: "Court 2", skeddaId: "1321587" },
                { name: "Center Court", skeddaId: "1321742" },
                { name: "Panoramic Court", skeddaId: "1354210" }
            ]
        };

        for (const [branchName, venues] of Object.entries(structure)) {
            // Find or Create Branch
            const [branch] = await Branch.findOrCreate({
                where: { name: branchName },
                defaults: {
                    location: branchName,
                    isActive: true,
                    phone: '0000000000',
                    email: 'info@padel.com'
                }
            });
            console.log(`📍 Processed Branch: ${branch.name}`);

            for (const vData of venues) {
                // Find or Create Venue
                // We use name and branchId to identify unique venue
                const [venue, created] = await Venue.findOrCreate({
                    where: {
                        name: vData.name,
                        branchId: branch.id
                    },
                    defaults: {
                        description: `Imported from Skedda (ID: ${vData.skeddaId})`,
                        location: branch.location,
                        pricePerHour: 200, // Default price
                        type: 'Outdoor'
                    }
                });
                console.log(`   - ${created ? 'Created' : 'Found'} Venue: ${venue.name} (Skedda ID: ${vData.skeddaId})`);
            }
        }

    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await sequelize.close();
    }
};

seedStructure();
