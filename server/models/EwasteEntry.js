import mongoose from 'mongoose';

const ewasteEntrySchema = new mongoose.Schema(
  {
    captain_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    location_address: {
      type: String,
      default: null,
    },
    location_lat: {
      type: Number,
      default: null,
    },
    location_lng: {
      type: Number,
      default: null,
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 3;
        },
        message: 'Maximum 3 photos allowed'
      }
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Priced', 'Collection Planned', 'Pickup Scheduled', 'Collected', 'Processed', 'Payment Initiated', 'Paid'],
      default: 'Pending',
    },
    price: {
      type: Number,
      default: null,
    },
    collection_plan: {
      collection_date: {
        type: Date,
        default: null,
      },
      collection_time: {
        type: String,
        default: null,
      },
      collection_notes: {
        type: String,
        default: null,
      },
      collection_steps: {
        type: [String],
        default: [],
      },
    },
    pickup_date: {
      type: Date,
      default: null,
    },
    pickup_notes: {
      type: String,
      default: null,
    },
    payment_amount: {
      type: Number,
      default: null,
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Initiated', 'Completed'],
      default: 'Pending',
    },
    admin_notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('EwasteEntry', ewasteEntrySchema);
