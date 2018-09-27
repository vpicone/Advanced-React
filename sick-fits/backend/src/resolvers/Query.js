const { forwardTo } = require('prisma-binding');
const Query = {
  items: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  item: forwardTo('db'),
  me(p, args, ctx, info) {
    if (!ctx.request.userId) {
      // no one logged in
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
  },
};

module.exports = Query;
