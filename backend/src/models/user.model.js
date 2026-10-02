import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    fullName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    profilePicture: {
        type: String,
        default: ''
    },

    clerkId: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;