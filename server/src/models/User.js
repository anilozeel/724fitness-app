import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING },
      // Şifre hash'lenmiş olarak saklanır, asla düz metin değil
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      // Rol: member (üye), trainer (eğitmen), admin (yönetici)
      role: {
        type: DataTypes.ENUM('member', 'trainer', 'admin'),
        allowNull: false,
        defaultValue: 'member',
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      lastLoginAt: { type: DataTypes.DATE },
    },
    {
      tableName: 'users',
      timestamps: true,
    }
  );

  // Düz şifreyi güvenli şekilde hash'leyip ayarlayan yardımcı
  User.prototype.setPassword = async function (plainPassword) {
    this.passwordHash = await bcrypt.hash(plainPassword, 10);
  };

  // Girişte şifre doğrulama
  User.prototype.checkPassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
  };

  // JSON'a çevrilirken şifreyi asla dışarı verme
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  return User;
};
