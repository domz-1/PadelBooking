module.exports = {
    DAILY_AVAILABILITY: `📅 *Today's Availability Update*
{date}

{slots}

🔗 *Book now:* {bookingUrl}`,

    BOOKING_CREATED: `🆕 *New Booking!*
👤 *User:* {userName}
🏟️ *Venue:* {venueName}
🕒 *Time:* {startTime} - {endTime}
📅 *Date:* {date}
💰 *Price:* {price} {currency}`,

    BOOKING_CANCELLED: `❌ *Booking Cancelled*
👤 *User:* {userName}
🏟️ *Venue:* {venueName}
🕒 *Time:* {startTime} - {endTime}
📅 *Date:* {date}
📜 *Reason:* {reason}`,

    BOOKING_UPDATED: `🔄 *Booking Updated*
👤 *User:* {userName}
🏟️ *Venue:* {venueName}
🕒 *Time:* {startTime} - {endTime}
📅 *Date:* {date}
📝 *Changes:*
{changes}`,

    STORE_ORDER: `🛒 *New Store Order!*
👤 *Customer:* {userName}
💰 *Total:* {totalAmount} {currency}
📦 *Items:*
{items}

💳 *Payment:* {paymentMethod}`
};
