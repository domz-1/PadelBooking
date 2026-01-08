# 🌱 Padel Unified Seeding System

## Overview

This guide explains the new unified seeding system that replaces all previous seeding methods. The system uses:

- **CSV files** for users and bookings (real-world data)
- **Code definitions** for branches and venues (structured, maintainable)
- **Single script** for all seeding operations

## Key Features

✅ **Unified Approach**: One script handles everything
✅ **Real Data**: Uses actual CSV exports from your booking system
✅ **Maintainable**: Branches/venues defined in code for easy updates
✅ **Efficient**: Bulk operations for fast seeding
✅ **Robust**: Handles edge cases and data validation

## File Structure

```
server/
├── scripts/
│   └── unified-seeder.js      # Main seeding script
├── seeds/
│   ├── bookings.csv           # Real booking data (CSV format)
│   └── venueusers.csv         # Optional venue-user mappings
└── SEEDING_GUIDE.md           # This guide
```

## How It Works

### 1. Branches (Code-defined)

Branches are defined in the script with full details:

```javascript
const branchesData = [
    {
        name: "El Giesh St",
        location: "El Giesh Street, Cairo",
        description: "Premium padel facilities in the heart of Cairo",
        isActive: true,
        phone: "+20 10 00000001",
        email: "elgiesh@padel.com"
    },
    {
        name: "Ring Road",
        location: "Ring Road, Cairo",
        description: "State-of-the-art padel courts with panoramic views",
        isActive: true,
        phone: "+20 10 00000002",
        email: "ringroad@padel.com"
    }
];
```

### 2. Venues (Code-defined)

Venues are also defined in code with pricing and types:

```javascript
const venuesData = [
    { name: "Center Court", branch: "El Giesh St", pricePerHour: 300, type: "Indoor" },
    { name: "Court 1", branch: "El Giesh St", pricePerHour: 250, type: "Outdoor" },
    // ... more venues
];
```

### 3. Users (CSV-based)

Users are extracted from the bookings CSV file:

- Extracts unique emails from `Holder email` column
- Creates user records with names from `Holder first name` and `Holder last name`
- Uses phone numbers from `Holder telephone`
- All users get the same default password (`password123`)

### 4. Bookings (CSV-based)

Bookings are parsed from the CSV with:

- **Date/Time**: From `Scheduled start` and `End` columns
- **Venue**: Parsed from `Spaces` column (e.g., "🔴 Court 1 (El Giesh St)")
- **User**: Matched by email from `Holder email`
- **Status**: "confirmed" if `Payment status` is "Paid", otherwise "pending"
- **Price**: From `Price` column
- **Payment Method**: "instapay" if `Type` is "Instapay", otherwise "cash"

### 5. Additional Data

The script also seeds:

- **Admin User**: `admin@padel.com` with password `password123`
- **Coach**: Sample coach with profile
- **Sports**: Padel and Padbol
- **Sponsors**: Sample sponsors
- **Products**: Sample store products

## Usage

### Run the Seeder

```bash
cd server
npm run seed
```

### Expected Output

```
🌱 Starting unified seed process...
✅ Connected to database
🔄 Database synced successfully

📍 Seeding branches...
   ✅ Created branch: El Giesh St
   ✅ Created branch: Ring Road

🏟️  Seeding venues...
   ✅ Created venue: Center Court (El Giesh St)
   ✅ Created venue: Court 1 (El Giesh St)
   ...

👥 Seeding users from CSV...
   📊 Found 1234 unique users in bookings CSV
   ✅ Created admin user: admin@padel.com
   ✅ Created coach user: coach.ahmed@padel.com
   ✅ Created 1236 total users

📅 Seeding bookings from CSV...
   📊 Processed 8426 CSV rows
   ✅ Valid bookings: 7892
   ⚠️  Skipped bookings: 534
   📝 Created 7892 bookings...

🎾 Seeding sports...
   ✅ Sports seeded

🏆 Seeding sponsors...
   ✅ Sponsors seeded

🛒 Seeding products...
   ✅ Products seeded

🏅 Seeding coaches...
   ✅ Coaches seeded

🎉 Seeding completed successfully!

📊 Seeding Summary:
   📍 Branches: 2
   🏟️  Venues: 8
   👥 Users: 1236
   📅 Bookings: 7892
   🎾 Sports: 2
   🏆 Sponsors: 2
   🛒 Products: 2
   🏅 Coaches: 1

🔐 Admin credentials:
   Email: admin@padel.com
   Password: password123
```

## CSV Format Requirements

The `bookings.csv` file should have these columns:

| Column | Required | Description |
|--------|----------|-------------|
| `Scheduled start` | ✅ Yes | Booking start date/time |
| `End` | ✅ Yes | Booking end date/time |
| `Spaces` | ✅ Yes | Venue name with branch (e.g., "Court 1 (El Giesh St)") |
| `Holder email` | ✅ Yes | User's email address |
| `Holder first name` | ❌ No | User's first name |
| `Holder last name` | ❌ No | User's last name |
| `Holder telephone` | ❌ No | User's phone number |
| `Price` | ❌ No | Booking price |
| `Payment status` | ❌ No | "Paid" or other status |
| `Type` | ❌ No | Booking type (e.g., "Instapay") |
| `Title` | ❌ No | Booking notes/title |

## Customization

### Add New Branches

Edit the `branchesData` array in `unified-seeder.js`:

```javascript
const branchesData = [
    // ... existing branches
    {
        name: "New Branch",
        location: "Address here",
        description: "Description here",
        isActive: true,
        phone: "+20 10 00000003",
        email: "newbranch@padel.com"
    }
];
```

### Add New Venues

Edit the `venuesData` array:

```javascript
const venuesData = [
    // ... existing venues
    { name: "New Court", branch: "El Giesh St", pricePerHour: 275, type: "Outdoor" }
];
```

### Update CSV Data

1. Export your latest bookings data to CSV
2. Save as `server/seeds/bookings.csv`
3. Run the seeder again

## Troubleshooting

### Common Issues

**Issue**: "Bookings CSV file not found"
**Solution**: Ensure `bookings.csv` exists in `server/seeds/`

**Issue**: "Venue not found for booking"
**Solution**: Check that venue names in CSV match code definitions

**Issue**: "User not found for booking"
**Solution**: Verify email addresses in CSV are valid

**Issue**: "Invalid date format"
**Solution**: Ensure CSV dates are in ISO format

### Debugging

Add `console.log()` statements in the parsing functions to debug specific issues.

## Migration from Old System

The new system replaces:

- `server/src/seeder.js` (removed)
- `server/scripts/seed-with-statuses.js` (removed)
- `server/scripts/seed-admin.js` (removed)
- `server/scripts/seed-skedda-structure.js` (removed)
- `server/seeds/seed_data.json` (removed)

All functionality is now in `server/scripts/unified-seeder.js`.

## Best Practices

1. **Backup your database** before running the seeder
2. **Test with small datasets** first
3. **Validate CSV data** before importing
4. **Update code definitions** when adding new branches/venues
5. **Use version control** for your seed files

## Support

For issues or questions, refer to the main project documentation or contact the development team.