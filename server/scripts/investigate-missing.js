require('dotenv').config();
const skeddaService = require('../src/modules/bookings/skedda.service');

async function investigateMissing() {
    console.log('\n=== Investigating Missing Bookings for TODAY (2026-01-07) ===\n');

    // Date Range: 2026-01-07 Full Day
    const start = '2026-01-07T00:00:00';
    const end = '2026-01-07T23:59:59';

    // Known Map (Hardcoded in Service)
    const skeddaMap = {
        "1080512": "Ring Road - Court 1",
        "1080513": "Ring Road - Solo Padel",
        "1250704": "Ring Road - Court 2",
        "1321586": "El Giesh St - Court 1",
        "1321587": "El Giesh St - Court 2",
        "1321742": "El Giesh St - Center Court",
        "1354209": "El Giesh St - Padbol Point (1)",
        "1354210": "El Giesh St - Panoramic Court"
    };

    try {
        console.log(`Fetching bookings from Skedda for: ${start} to ${end}`);

        // 1. Fetch RAW data (what Skedda returns)
        // We use the internal fetch method if possible, but getFormattedBookings calls it.
        // Let's rely on getFormattedBookings logic but Add Logging inside the service? 
        // Or better, fetch using the public method and infer.
        // getFormattedBookings filters by date.

        // Let's call the public method and see what we get.
        const formatted = await skeddaService.getFormattedBookings(start, end);
        console.log(`\n--- Formatted Bookings (Visible in App): ${formatted.length} ---`);
        formatted.forEach(b => {
            console.log(`[${b.startTime}-${b.endTime}] ${b.Venue ? b.Venue.name : 'Unknown Venue'} (ID: ${b.skeddaId})`);
        });

        // 2. Fetch Raw Data using the same method logic (manual call to fetchSkeddaBookings)
        // Note: fetchSkeddaBookings adds buffer days, we should replicate that to see what the raw pool is.
        const startEgyptTime = new Date(start);
        const endEgyptTime = new Date(end);
        const fetchStart = new Date(startEgyptTime);
        fetchStart.setDate(fetchStart.getDate() - 1); // -1 day buffer
        const fetchEnd = new Date(endEgyptTime);
        fetchEnd.setDate(fetchEnd.getDate() + 1);   // +1 day buffer

        const fetchStartStr = fetchStart.toISOString().split('.')[0];
        const fetchEndStr = fetchEnd.toISOString().split('.')[0];

        console.log(`\n--- Fetching Raw Pool (${fetchStartStr} -> ${fetchEndStr}) ---`);
        const raw = await skeddaService.fetchSkeddaBookings(fetchStartStr, fetchEndStr);
        console.log(`Raw Pool Size: ${raw.length}`);

        // 3. Analyze potential "misses"
        // We are looking for bookings that *should* be on 2026-01-07 but aren't in `formatted`.

        const sDateTarget = new Date(start);
        const eDateTarget = new Date(end);

        console.log('\n--- Analyzing Rejected/Hidden Bookings ---');

        for (const booking of raw) {
            // Is it single or recurring?
            let instances = [];

            // Logic duplicated from service for analysis
            if (booking.recurrenceRule) {
                // ... simplistic check: does it have an occurrence today?
                // We won't re-implement full rrule logic here unless needed.
                // Just checking if it looks like it should match.
                instances.push({ type: 'recurring', id: booking.id, space: booking.spaces[0] });
            } else {
                // Single
                // Literals!
                const bStart = new Date(booking.start);
                const bEnd = new Date(booking.end);

                // Does it overlap today?
                if (bStart < eDateTarget && bEnd > sDateTarget) {
                    instances.push({ type: 'single', id: booking.id, start: booking.start, space: booking.spaces[0] });
                }
            }

            // Debug specific booking unconditionally
            if (booking.id === 93680974) {
                console.log('--- DEBUG BOOKING 93680974 (RAW) ---');
                console.log('Raw Start:', booking.start);
                console.log('Raw End:', booking.end);
                console.log('Rule:', booking.recurrenceRule);
                console.log('Spaces:', booking.spaces);
                console.log('------------------------------');
            }

            // For each "candidate", check if it made it to formatted
            for (const inst of instances) {
                const found = formatted.find(f => f.skeddaId === String(booking.id));

                if (!found && inst.type === 'single') {
                    // Single booking overlapping today BUT not in formatted?
                    const spaceName = skeddaMap[String(inst.space)] || "Unknown Space ID";
                    console.log(`[MISSING] Single Booking ID ${booking.id}`);
                    console.log(`   Time: ${booking.start} - ${booking.end}`);
                    console.log(`   Space: ${spaceName} (${inst.space})`);
                    console.log(`   Reason: Likely filtering logic or venue mapping?`);
                }

                if (!found && inst.type === 'recurring') {
                    // It's harder to check if a recurring booking *should* have an occurrence today without rrule.
                    // But we can check if the Space is valid.
                    // Debug specific booking
                    if (booking.id === 93680974) { // Assuming originalId refers to the raw booking's 'id'
                        console.log('--- DEBUG BOOKING 93680974 ---');
                        console.log('Raw Start:', booking.start); // Using 'booking.start' from the raw object
                        console.log('Raw End:', booking.end);     // Using 'booking.end' from the raw object
                        // The following properties (startTimeStr, endTimeStr) are not available on the raw booking object
                        // and would typically be on a formatted booking.
                        // If the intent was to compare raw vs formatted, 'found' would be needed.
                        // For now, logging raw properties.
                        console.log('Computed Duration (min):', (new Date(booking.end) - new Date(booking.start)) / 60000);
                        console.log('------------------------------');
                    }
                }
            }
        }

    } catch (e) {
        console.error(e);
    }
}

investigateMissing();
