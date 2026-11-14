import sequelize from '../config/db.js';
import UserModel from './User.js';
import PlanModel from './Plan.js';
import SubscriptionModel from './Subscription.js';
import GymClassModel from './GymClass.js';
import ClassSessionModel from './ClassSession.js';
import BookingModel from './Booking.js';
import PaymentModel from './Payment.js';
import LeadModel from './Lead.js';

// Modelleri oluştur
const User = UserModel(sequelize);
const Plan = PlanModel(sequelize);
const Subscription = SubscriptionModel(sequelize);
const GymClass = GymClassModel(sequelize);
const ClassSession = ClassSessionModel(sequelize);
const Booking = BookingModel(sequelize);
const Payment = PaymentModel(sequelize);
const Lead = LeadModel(sequelize);

// ===== İlişkiler (Associations) =====

// Üye -> Abonelikler
User.hasMany(Subscription, { foreignKey: 'userId', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

// Paket -> Abonelikler
Plan.hasMany(Subscription, { foreignKey: 'planId' });
Subscription.belongsTo(Plan, { foreignKey: 'planId' });

// Ders -> Seanslar
GymClass.hasMany(ClassSession, { foreignKey: 'gymClassId', onDelete: 'CASCADE' });
ClassSession.belongsTo(GymClass, { foreignKey: 'gymClassId' });

// Eğitmen (User) -> Seanslar
User.hasMany(ClassSession, { foreignKey: 'trainerId', as: 'TaughtSessions' });
ClassSession.belongsTo(User, { foreignKey: 'trainerId', as: 'Trainer' });

// Rezervasyonlar: Üye <-> Seans (çoka-çok, Booking ara tablo)
User.hasMany(Booking, { foreignKey: 'userId', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId' });
ClassSession.hasMany(Booking, { foreignKey: 'classSessionId', onDelete: 'CASCADE' });
Booking.belongsTo(ClassSession, { foreignKey: 'classSessionId' });

// Ödemeler
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId' });

export {
  sequelize,
  User,
  Plan,
  Subscription,
  GymClass,
  ClassSession,
  Booking,
  Payment,
  Lead,
};
