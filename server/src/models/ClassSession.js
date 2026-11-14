import { DataTypes } from 'sequelize';

// Belirli bir tarih/saatteki ders seansı (örn. 20 Kasım 18:00 Yoga)
export default (sequelize) => {
  return sequelize.define(
    'ClassSession',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      startsAt: { type: DataTypes.DATE, allowNull: false },
      endsAt: { type: DataTypes.DATE, allowNull: false },
      // Kontenjan ve dolan yer sayısı
      capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
      bookedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      room: { type: DataTypes.STRING }, // "Salon 1", "Stüdyo A"
      status: {
        type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
        defaultValue: 'scheduled',
      },
    },
    { tableName: 'class_sessions', timestamps: true }
  );
};
