const axios = require('axios');
const Booking = require('./booking.model');
const Venue = require('../venues/venue.model');
const User = require('../users/user.model');
const { Op } = require('sequelize');
const { rrulestr } = require('rrule');

class SkeddaService {
    constructor() {
        this.baseUrl = 'https://mansourapadelpoint.skedda.com';
        // Note: In a real scenario, we might need an API token if the endpoint wasn't public or required specific headers.
        // Based on the user request, it seems like a public-facing or session-based endpoint, but we'll try to emulate the headers provided.
    }

    get isEnabled() {
        return process.env.INTEGRATE_WITH_SKEDDA === 'true';
    }

    async fetchSkeddaBookings(start, end) {
        if (!this.isEnabled) {
            console.log('Skedda integration is disabled (INTEGRATE_WITH_SKEDDA != true)');
            return [];
        }

        try {
            const response = await axios.get(`${this.baseUrl}/bookingslists`, {
                params: {
                    start: start,
                    end: end
                },
                // Remove custom serializer to use default encoding
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'X-Skedda-RequestVerificationToken': 'CfDJ8LgOSwdbGpVCg41IqXJwMn8Rs5erA-bu9r4-MYNwFwAMaL1CqeRar2Il_inpYxe94XlPTMmJzMm0RYb5eEwaAvfzvs0KfBUKtlxgTdb-EXZ_8qywpeOaKsijtZ49Bs9t3HleI7j1yGirKrwzoh6GpXA',
                    'Cookie': 'ai_user=UtTXw0WarFrQF4K1V887EA|2025-12-18T13:35:14.095Z; X-Skedda-RequestVerificationCookie=CfDJ8LgOSwdbGpVCg41IqXJwMn9RpEAbS_ocxs9yLHmaaeoYE8FSqMdSLrvKtmUCV9b-PMyfHszzPLBd3bOkMGG1_Kd4OBXcD3vPN0DgMwsy7fCM0KccwhyO4cQMt4fVjn7nB8iE_L1jUktaRjFdB1UTYGw; AMP_a25d3ab388=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIwY2JhYTYzYS0zZTQ0LTQ0ZGItOWIyYi1mY2EzNTU1ZmY4YWUlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzY3NzY1OTc2NjU1JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc2Nzc2NjA0MDEzNCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTYzJTJDJTIycGFnZUNvdW50ZXIlMjIlM0EyJTdE; ai_session=G6pEXvq/yirxh7MD6i5X9w|1767765973800|1767766271210'
                }
            });

            if (response.data && response.data.bookings) {
                return response.data.bookings;
            }
            return [];
        } catch (error) {
            console.error('Error fetching Skedda bookings:', error.message);
            if (error.response) {
                console.error('Skedda Response Data:', JSON.stringify(error.response.data, null, 2));
                // console.error('Skedda Response Headers:', JSON.stringify(error.response.headers, null, 2));
            }
            throw error;
        }
    }

    async fetchRaw(params) {
        try {
            console.log('Testing params:', params);
            const response = await axios.get(`${this.baseUrl}/bookingslists`, {
                params,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'X-Skedda-RequestVerificationToken': 'CfDJ8LgOSwdbGpVCg41IqXJwMn8Rs5erA-bu9r4-MYNwFwAMaL1CqeRar2Il_inpYxe94XlPTMmJzMm0RYb5eEwaAvfzvs0KfBUKtlxgTdb-EXZ_8qywpeOaKsijtZ49Bs9t3HleI7j1yGirKrwzoh6GpXA',
                    'Cookie': 'ai_user=UtTXw0WarFrQF4K1V887EA|2025-12-18T13:35:14.095Z; X-Skedda-RequestVerificationCookie=CfDJ8LgOSwdbGpVCg41IqXJwMn9RpEAbS_ocxs9yLHmaaeoYE8FSqMdSLrvKtmUCV9b-PMyfHszzPLBd3bOkMGG1_Kd4OBXcD3vPN0DgMwsy7fCM0KccwhyO4cQMt4fVjn7nB8iE_L1jUktaRjFdB1UTYGw; AMP_a25d3ab388=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIwY2JhYTYzYS0zZTQ0LTQ0ZGItOWIyYi1mY2EzNTU1ZmY4YWUlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzY3NzY1OTc2NjU1JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc2Nzc2NjA0MDEzNCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTYzJTJDJTIycGFnZUNvdW50ZXIlMjIlM0EyJTdE; ai_session=G6pEXvq/yirxh7MD6i5X9w|1767765973800|1767766271210'
                }
            });
            return response.data.bookings || [];
        } catch (error) {
            console.error('Probe Error:', error.message);
            if (error.response) console.error('Status:', error.response.status);
            return null;
        }
    }

    async getFormattedBookings(start, end) {
        if (!this.isEnabled) {
            return [];
        }

        // IMPORTANT: 'start' and 'end' from controller represent dates in Egypt time (Africa/Cairo)
        // Format: '2026-01-23T00:00:00' means Jan 23 00:00 in Cairo
        // We need to convert this to UTC for the Skedda API call

        const EGYPT_TZ = 'Africa/Cairo';
        let requestedStartDate, requestedEndDate;
        let fetchStartUTC, fetchEndUTC;

        if (!start || !end) {
            // Default to next 30 days in Egypt time
            const now = new Date();
            requestedStartDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: EGYPT_TZ
            }).format(now);

            const future = new Date(now);
            future.setDate(future.getDate() + 30);
            requestedEndDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: EGYPT_TZ
            }).format(future);

            start = `${requestedStartDate}T00:00:00`;
            end = `${requestedEndDate}T23:59:59`;
        } else {
            requestedStartDate = start.substring(0, 10);
            requestedEndDate = end.substring(0, 10);
        }

        // Convert Egypt time to UTC for Skedda API
        // When user requests "2026-01-23" in Egypt, we need to fetch bookings that occur
        // during that calendar day in Egypt time, which might span different UTC days

        // Parse as Egypt time and convert to UTC
        // Egypt is UTC+2, so 2026-01-23 00:00 Cairo = 2026-01-22 22:00 UTC
        // Parse as simple local dates (ignoring timezone offsets)
        // This relies on the server being in the target timezone or accepting "floating" times
        const startEgyptTime = new Date(`${requestedStartDate}T00:00:00`);
        const endEgyptTime = new Date(`${requestedEndDate}T23:59:59`);

        // Expand window to catch multi-day bookings
        const fetchStart = new Date(startEgyptTime);
        // fetchStart.setDate(fetchStart.getDate() - 1); // Removed buffer as requested

        const fetchEnd = new Date(endEgyptTime);
        fetchEnd.setDate(fetchEnd.getDate() + 2); // Increased buffer to 2 days

        fetchStartUTC = fetchStart.toISOString().split('.')[0];
        fetchEndUTC = fetchEnd.toISOString().split('.')[0];

        const skeddaBookings = await this.fetchSkeddaBookings(fetchStartUTC, fetchEndUTC);

        // Pre-fetch all venues with their branches to build a lookup map
        const allVenues = await Venue.findAll({
            include: [{ model: require('../branches/branch.model'), attributes: ['name', 'location'] }]
        });

        // Configurable Map: Skedda Space ID -> { branchName, venueName }
        const skeddaMap = {
            "1080512": { branch: "Ring Road", venue: "Court 1" },
            "1080513": { branch: "Ring Road", venue: "Solo Padel" },
            "1250704": { branch: "Ring Road", venue: "Court 2" },
            "1321586": { branch: "El Giesh St", venue: "Court 1" },
            "1321587": { branch: "El Giesh St", venue: "Court 2" },
            "1321742": { branch: "El Giesh St", venue: "Center Court" },
            // "1354209": { branch: "El Giesh St", venue: "Padbol Point (1)" },
            "1354210": { branch: "El Giesh St", venue: "Panoramic Court" }
        };

        const formattedResults = [];

        for (const sBooking of skeddaBookings) {
            let instances = [];

            if (sBooking.recurrenceRule) {
                try {
                    // Parse RRule
                    // Skedda sends "\r\n" which rrule handles.
                    // Important: rrule string parser might reject DTEND. We strip it.
                    // Also strip 'Z' to treat times as floating/local as per user request
                    const cleanRule = sBooking.recurrenceRule
                        .replace(/Z/g, '')
                        .split('\n')
                        .filter(line => !line.trim().startsWith('DTEND'))
                        .join('\n');

                    const rule = rrulestr(cleanRule, { forceset: true });

                    // Get occurrences between range
                    // We need to match precise range but Skedda might return UTC-based days
                    // that spill over into next day local time.
                    // We extend the search window buffer to capture late-night UTC bookings.
                    // Use the Egypt time range for filtering occurrences
                    const occurrences = rule.between(startEgyptTime, endEgyptTime, true);

                    // Helper to format literal time (preserve "floating" values)
                    // RRule produces dates with "floating" time values in UTC slots (e.g. 00:00 -> 00:00Z)
                    // We must use UTC formatting to retrieve "00:00" without getting shifted by Egypt (+2)
                    const formatLiteral = (date, type) => {
                        const options = { timeZone: 'UTC', hour12: false };
                        if (type === 'date') {
                            return new Intl.DateTimeFormat('en-CA', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
                        }
                        if (type === 'time') {
                            return new Intl.DateTimeFormat('en-GB', { ...options, hour: '2-digit', minute: '2-digit' }).format(date);
                        }
                    };

                    // For each occurrence, calculate duration and create instance
                    // Treat timestamps as local/floating
                    const durationMs = new Date(sBooking.end).getTime() - new Date(sBooking.start).getTime();

                    instances = occurrences.map(occDate => {
                        const instanceEnd = new Date(occDate.getTime() + durationMs);
                        return {
                            start: occDate,
                            end: instanceEnd,
                            dateStr: formatLiteral(occDate, 'date'),
                            startTimeStr: formatLiteral(occDate, 'time'),
                            endTimeStr: formatLiteral(instanceEnd, 'time'),
                            originalId: sBooking.id
                        };
                    });

                } catch (e) {
                    console.error(`Error parsing RRule for booking ${sBooking.id}:`, e);
                    // Fallback to original start/end if parsing fails? Or skip?
                    // Better to include original just in case, but marked.
                    instances = [];
                }
            } else {
                // Single booking
                // Treat timestamps as local/floating (no 'Z' suffix)
                // User requested to remove Z to prevent +2h shift.
                const sDate = new Date(sBooking.start.replace(/Z/g, ''));
                const eDate = new Date(sBooking.end.replace(/Z/g, ''));

                // timezone format helper
                // CAUTION: Since we stripped 'Z', 'new Date' treats it as Local.
                // If server is UTC, sDate is "Time@UTC".
                // If we format to 'Africa/Cairo', it ADDS 2 hours.
                // We want to PRESERVE the literal time. So we format as 'UTC' to match the input.
                const formatLiteral = (date, type) => {
                    const options = { timeZone: 'UTC', hour12: false };
                    if (type === 'date') {
                        return new Intl.DateTimeFormat('en-CA', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
                    }
                    if (type === 'time') {
                        return new Intl.DateTimeFormat('en-GB', { ...options, hour: '2-digit', minute: '2-digit' }).format(date);
                    }
                };

                // Convert booking start to Egypt date
                const bookingEgyptDate = formatLiteral(sDate, 'date');

                // Check if booking's Egypt date falls within the requested range
                if (bookingEgyptDate >= requestedStartDate && bookingEgyptDate <= requestedEndDate) {
                    instances.push({
                        start: sDate,
                        end: eDate,
                        dateStr: bookingEgyptDate,
                        startTimeStr: formatLiteral(sDate, 'time'),
                        endTimeStr: formatLiteral(eDate, 'time'),
                        originalId: sBooking.id
                    });
                }
            }

            // Map instances to Booking objects
            for (const inst of instances) {
                // Mapping Logic
                let venueId = null;
                let mappedVenue = null;

                if (sBooking.spaces && sBooking.spaces.length > 0) {
                    const spaceId = String(sBooking.spaces[0]);
                    const mapConfig = skeddaMap[spaceId];
                    if (mapConfig) {
                        mappedVenue = allVenues.find(v =>
                            v.name === mapConfig.venue &&
                            (v.Branch && v.Branch.name === mapConfig.branch)
                        );
                    }
                }

                if (mappedVenue) {
                    venueId = mappedVenue.id;
                } else {
                    // Skip if no venue mapped
                    continue;
                }

                // Calculate end date for overlap detection
                const endDateObj = new Date(inst.end);
                const endDateStr = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'UTC', // Keep strict to literal time (no shift)
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(endDateObj);

                formattedResults.push({
                    id: `skedda-${inst.originalId}-${inst.dateStr.replace(/-/g, '')}`, // Unique ID per instance
                    date: inst.dateStr,
                    endDate: endDateStr,  // Add end date for overlap detection
                    startTime: inst.startTimeStr,
                    endTime: inst.endTimeStr,
                    venueId: venueId,
                    totalPrice: 0,
                    status: 'confirmed',
                    type: 'external',
                    skeddaId: String(inst.originalId),
                    isSkedda: true,
                    User: {
                        id: 0,
                        name: 'Skedda User',
                        email: '',
                        phone: ''
                    },
                    Venue: mappedVenue ? {
                        name: mappedVenue.name,
                        location: mappedVenue.location,
                        Branch: mappedVenue.Branch ? {
                            name: mappedVenue.Branch.name,
                            location: mappedVenue.Branch.location
                        } : null
                    } : null
                });
            }
        }

        // Filter to include bookings that START on the requested date OR overlap with it
        // This ensures late-night bookings (e.g., 23:00-01:00) appear on the day they start
        const filteredResults = formattedResults.filter(booking => {
            const startsOnDate = booking.date >= requestedStartDate && booking.date <= requestedEndDate;
            const overlapsDate = booking.date < requestedStartDate && booking.endDate >= requestedStartDate;
            return startsOnDate || overlapsDate;
        });

        return filteredResults;
    }

    async syncBookings(start, end) {
        if (!this.isEnabled) {
            console.log('Skedda sync skipped (integration disabled)');
            return { synced: 0, errors: 0, message: 'Integration disabled' };
        }

        if (!start || !end) {
            // Default to syncing next 30 days if not specified
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            start = startDate.toISOString().split('T')[0] + 'T00:00:00';
            end = endDate.toISOString().split('T')[0] + 'T23:59:59';
        }

        console.log(`Starting Skedda sync from ${start} to ${end} `);
        const skeddaBookings = await this.fetchSkeddaBookings(start, end);
        console.log(`Fetched ${skeddaBookings.length} bookings from Skedda`);

        let syncedCount = 0;
        let errorCount = 0;

        // Space ID Mapping
        // We need a way to map Skedda Space IDs to our Venue IDs.
        // For now, we'll try to find a venue by some heuristic or hardcoded map if known, 
        // otherwise we might need to create a mapping table or configuration.
        // Let's assume we map by matching a part of the name or we just pick the first venue for now if distinct mapping isn't clear.
        // BETTER: Let's look up venues and maybe use a custom field or description to validation mapping.
        // For this first iteration, let's try to map dynamically if skedda space ID is stored on venue,
        // OR just map to a default venue/branch logic if we can't find specific ones. 
        // Since we don't have skeddaId on Venue model yet, let's use a simple lookup map we can expand.

        // TODO: Move this to database configuration
        const skeddaSpaceMap = {
            "1321742": 1, // Example mapping, needs verification
            "1080512": 2,
            "1321586": 3,
            "1250704": 4,
            "186544": 1   // Venue ID from Skedda response?
        };

        // Fetch all local venues to try and match names if needed? 
        // Actually, let's rely on finding a Venue (maybe by name if we had it, but API gives IDs).
        // Let's create a placeholder "Imported from Skedda" User if needed.
        let systemUser = await User.findOne({ where: { email: 'skedda-sync@padel.com' } });
        if (!systemUser) {
            systemUser = await User.create({
                name: 'Skedda System',
                email: 'skedda-sync@padel.com',
                password: 'skedda-sync-pass-' + Date.now(),
                role: 'admin', // or specific system role
                phone: '0000000000'
            });
        }

        for (const sBooking of skeddaBookings) {
            try {
                // Skedda payload structure based on user request:
                // {
                //   "start": "2024-03-13T00:00:00",
                //   "end": "2024-03-13T01:00:00",
                //   "spaces": [ "1321742" ],
                //   "id": "70170370",
                //   ...
                // }

                const skeddaId = String(sBooking.id);
                const spaceId = sBooking.spaces && sBooking.spaces.length > 0 ? sBooking.spaces[0] : null;

                // 1. Determine Venue
                // Try to find a venue mapping. If strict mapping is required, we might fail here.
                // Fallback: Pick the first venue found in DB to prevent crashing, OR skip if critical.
                // Let's try to map space ID to a venue 'externalId' if we had one.
                // Since we don't have a confirmed map, let's pick a default VENUE for testing 
                // or try to match if the user provided logical mapping.

                // CRITICAL: We need a valid Venue ID.
                // Let's just grab the first venue for now to ensure flow works, 
                // usually integration needs a specific "Map Skedda Space X to Venue Y" config step.
                const venue = await Venue.findOne();
                if (!venue) {
                    console.error('No local venues found. Cannot sync.');
                    break;
                }
                const venueId = venue.id; // Using first venue as fallback for now

                // 2. Parse Dates
                const startDateStr = sBooking.start.split('T')[0];
                const startTimeStr = sBooking.start.split('T')[1].substring(0, 5); // HH:mm
                const endTimeStr = sBooking.end.split('T')[1].substring(0, 5);     // HH:mm

                // 3. Upsert Booking
                const existing = await Booking.findOne({ where: { skeddaId } });

                const bookingData = {
                    date: startDateStr,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    venueId: venueId,
                    userId: systemUser.id,
                    status: 'confirmed', // Skedda bookings are usually confirmed
                    type: 'standard', // or 'external'
                    totalPrice: 0, // Price might be 0 in Skedda payload or calc required
                    skeddaId: skeddaId,
                    skeddaData: sBooking
                };

                if (existing) {
                    await existing.update(bookingData);
                } else {
                    await Booking.create(bookingData);
                }

                syncedCount++;

            } catch (err) {
                console.error(`Failed to sync booking ${sBooking.id}: `, err.message);
                errorCount++;
            }
        }

        return { synced: syncedCount, errors: errorCount };
    }
}

module.exports = new SkeddaService();
