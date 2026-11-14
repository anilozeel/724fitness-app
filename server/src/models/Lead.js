import { DataTypes } from 'sequelize';

// Tanıtım sitesindeki "Ücretsiz Deneme" formundan gelen talepler
export default (sequelize) => {
  return sequelize.define(
    'Lead',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false }, // Ad Soyad
      phone: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING },
      interest: { type: DataTypes.STRING }, // ilgi alanı (Fitness, Grup dersleri...)
      kvkk: { type: DataTypes.BOOLEAN, defaultValue: false },
      sourcePage: { type: DataTypes.STRING }, // formun doldurulduğu sayfa
      status: {
        type: DataTypes.ENUM('new', 'contacted', 'converted', 'closed'),
        defaultValue: 'new',
      },
    },
    { tableName: 'leads', timestamps: true }
  );
};
