import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    captain_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ewaste_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EwasteEntry',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Note: Balance is updated manually in routes when payment status changes to 'Completed'
// This prevents double-counting and gives us more control

export default mongoose.model('Payment', paymentSchema);
