import { DataTypes } from 'sequelize';

// Ders türü (örn. Yoga, Pilates, Spinning, Crossfit)
export default (sequelize) => {
  return sequelize.define(
    'GymClass',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      // Ortalama süre (dakika)
      durationMin: { type: DataTypes.INTEGER, defaultValue: 60 },
      level: {
        type: DataTypes.ENUM('all', 'beginner', 'intermediate', 'advanced'),
        defaultValue: 'all',
      },
      color: { type: DataTypes.STRING, defaultValue: '#e11d2a' }, // takvimde renk
      imageUrl: { type: DataTypes.STRING },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: 'gym_classes', timestamps: true }
  );
};
