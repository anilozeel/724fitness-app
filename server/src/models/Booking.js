import { DataTypes } from 'sequelize';

// Bir üyenin bir ders seansına yaptığı rezervasyon
export default (sequelize) => {
  return sequelize.define(
    'Booking',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      status: {
        type: DataTypes.ENUM('booked', 'cancelled', 'attended', 'no_show'),
        defaultValue: 'booked',
      },
      bookedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'bookings',
      timestamps: true,
      // Aynı üye aynı seansa iki kez kayıt olamaz
      indexes: [{ unique: true, fields: ['user_id', 'class_session_id'] }],
    }
  );
};
