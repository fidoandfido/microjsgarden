module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      uniqueId: {
        type: DataTypes.UUID,
        field: 'unique_id',
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,

      hooks: {
        beforeSave: (_user, _options) => {
          throw new Error('User is read-only');
        },
      },
    },
  );
  return User;
};
