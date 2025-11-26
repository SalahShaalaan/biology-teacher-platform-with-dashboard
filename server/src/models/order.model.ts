import { Schema, model, Document } from "mongoose";

export interface IOrder extends Document {
  name: string;
  phone: string;
  grade: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    grade: { type: String, required: true },
    age: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = model<IOrder>("Order", orderSchema);

export default Order;
