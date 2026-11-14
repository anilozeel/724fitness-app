import { DataTypes } from 'sequelize';

// Abonelik paketleri (örn. Aylık, 3 Aylık, Yıllık)
export default (sequelize) => {
  return sequelize.define(
    'Plan',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false }, // "Aylık Üyelik"
      description: { type: DataTypes.TEXT },
      // Fiyat kuruş/cent cinsinden saklanır (küsurat hatalarını önlemek için)
      priceCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      currency: { type: DataTypes.STRING, defaultValue: 'TRY' },
      // Paketin süresi (gün)
      durationDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
      // Bu pakette aylık kaç ders hakkı var (null = sınırsız)
      classQuota: { type: DataTypes.INTEGER, allowNull: true },
      features: { type: DataTypes.TEXT }, // JSON string: ["Havuz", "Sauna"]
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'plans', timestamps: true }
  );
};
