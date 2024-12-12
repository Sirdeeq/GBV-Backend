import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  full_name: string;
  email: string;
  organization: string;
  phone: string;
  address: string;
  age: number;
  role: 'user' | 'admin' | 'superadmin';
  profileImage?: string;
  password?: string;
  verificationCode?: string | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    organization: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    profileImage: { 
      type: String, 
      default: 'https://example.com/default-profile-image.png' 
    }, // Replace with your default image URL
    password: { type: String, required: true },
    verificationCode: { type: String, required: false, default: null },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password!);
};

export default mongoose.model<IUser>('User', userSchema);
