import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  type: "income" | "expense" | "both";
  color: string;
  icon: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["income", "expense", "both"], default: "both" },
    color: { type: String, default: "#448aff" },
    icon: { type: String, default: "tag" },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
