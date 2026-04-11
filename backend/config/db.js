const mongoose = require('mongoose');

const connectDB = async () => {
    
    try {
        await mongoose.connect(process.env.MONGODB_URI) 
        
       
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }finally{
        console.log("Connected DB:", mongoose.connection.name);
    }
};

module.exports = connectDB;