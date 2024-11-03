const Settings = require('../models/Settings');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/errorHandler').ErrorResponse;

exports.getSettings = catchAsync(async (req, res) => {
  const settings = await Settings.findOne();
  res.status(200).json({
    status: 'success',
    data: settings
  });
});

exports.updateSettings = catchAsync(async (req, res) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, {
    new: true,
    runValidators: true,
    upsert: true
  });

  res.status(200).json({
    status: 'success',
    data: settings
  });
});

exports.updateMaintenance = catchAsync(async (req, res) => {
  const { isUnderMaintenance, maintenanceMessage } = req.body;
  
  const settings = await Settings.findOneAndUpdate({}, {
    'maintenance.isUnderMaintenance': isUnderMaintenance,
    'maintenance.maintenanceMessage': maintenanceMessage
  }, {
    new: true,
    runValidators: true,
    upsert: true
  });

  res.status(200).json({
    status: 'success',
    data: settings
  });
}); 