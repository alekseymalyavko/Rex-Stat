import mongoose from 'mongoose';

const { Schema } = mongoose;

const dataShema = new Schema({
  allActivity: { type: Object, required: true },
  basicInfo: { type: Object, required: true },
  calculatedData: { type: Object, required: true },
  dataForMark: { type: Object, required: true },
  members: { type: Object, required: true },
  pinnedPost: { type: Object, required: true },
  statistics: { type: Object, required: true },
  // cost: { type: String, default: '', },
  // currency: { type: String },
  // config: { type: Array, default: [] },
  // laboriousness: { type: Number },
  // employeeSalary: { type: Number },
  // isConfigured: { type: Boolean, default: false },
});

export const DataSchema = mongoose.model('DataShema', dataShema);
