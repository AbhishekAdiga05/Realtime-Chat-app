import bcrypt from "bcryptjs";
import {connectDB} from "../lib/db.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const seedUsers = [
  // Female Users
  {
    email: "ananya.sharma@example.com",
    fullName: "Ananya Sharma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    email: "isha.patel@example.com",
    fullName: "Isha Patel",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    email: "kavya.reddy@example.com",
    fullName: "Kavya Reddy",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    email: "meera.nair@example.com",
    fullName: "Meera Nair",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/13.jpg",
  },
  {
    email: "pooja.verma@example.com",
    fullName: "Pooja Verma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    email: "ritika.singh@example.com",
    fullName: "Ritika Singh",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/15.jpg",
  },
  {
    email: "sneha.iyer@example.com",
    fullName: "Sneha Iyer",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/16.jpg",
  },
  {
    email: "tanvi.joshi@example.com",
    fullName: "Tanvi Joshi",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/17.jpg",
  },

  // Male Users
  {
    email: "arjun.mehta@example.com",
    fullName: "Arjun Mehta",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    email: "rahul.sharma@example.com",
    fullName: "Rahul Sharma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    email: "rohit.verma@example.com",
    fullName: "Rohit Verma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    email: "vikram.reddy@example.com",
    fullName: "Vikram Reddy",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    email: "aman.gupta@example.com",
    fullName: "Aman Gupta",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/14.jpg",
  },
  {
    email: "karan.malhotra@example.com",
    fullName: "Karan Malhotra",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    email: "siddharth.nair@example.com",
    fullName: "Siddharth Nair",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/16.jpg",
  },
  {
    email: "yash.patel@example.com",
    fullName: "Yash Patel",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/17.jpg",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.deleteMany(); // clear old users (important)

    const usersWithHashedPasswords = await Promise.all(
      seedUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    await User.insertMany(usersWithHashedPasswords);

    console.log("✅ Database seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();