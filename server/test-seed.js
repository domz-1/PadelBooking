const { sequelize } = require("./src/config/database");
const User = require("./src/modules/users/user.model");

const testSeed = async () => {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected successfully.");

    console.log("Creating test user...");
    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "user",
      phone: "1234567890",
    });
    console.log("Test user created:", testUser.id);

    console.log("Counting users...");
    const userCount = await User.count();
    console.log("Total users:", userCount);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testSeed();
