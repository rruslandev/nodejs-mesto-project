import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string;
  about: string;
  avatar: string;
}

const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxLength: 30,
  },
  about: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  avatar: {
    type: String,
    required: true,
  },
})

const User: Model<IUser> = mongoose.model<IUser>('user', userSchema)

export default User
