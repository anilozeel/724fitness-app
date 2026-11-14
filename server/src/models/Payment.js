import { DataTypes } from 'sequelize';

// Ödeme kaydı. Ödeme sağlayıcı (iyzico/Stripe) sonradan bağlanacak;
// yapı şimdiden hazır olsun diye tablo baştan tanımlı.
export default (sequelize) => {
  return sequelize.define(
    'Payment',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      amountCents: { type: DataTypes.INTEGER, allowNull: false },
      currency: { type: DataTypes.STRING, defaultValue: 'TRY' },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      // Hangi sağlayıcı: manual (elden/havale), iyzico, paytr, stripe...
      provider: { type: DataTypes.STRING, defaultValue: 'manual' },
      // Sağlayıcının verdiği işlem kimliği (sonradan doldurulacak)
      providerRef: { type: DataTypes.STRING },
      paidAt: { type: DataTypes.DATE },
      note: { type: DataTypes.STRING },
    },
    { tableName: 'payments', timestamps: true }
  );
};
