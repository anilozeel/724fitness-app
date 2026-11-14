import { DataTypes } from 'sequelize';

// Bir üyenin aldığı abonelik (hangi paket, ne zaman başladı/bitiyor)
export default (sequelize) => {
  return sequelize.define(
    'Subscription',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      startDate: { type: DataTypes.DATEONLY, allowNull: false },
      endDate: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending'),
        defaultValue: 'pending',
      },
      // Bu dönemde kalan ders hakkı (null = sınırsız)
      remainingQuota: { type: DataTypes.INTEGER, allowNull: true },
      autoRenew: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: 'subscriptions', timestamps: true }
  );
};
