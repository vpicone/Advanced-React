const Mutations = {
  async createItem(p, args, ctx, info) {
    // TODO check if logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    );

    return item;
  },
  updateItem(p, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the id from the updates
    delete updates.id;

    // The info variable contains info about what was requested.
    // It allows you to tell 3rd party services the shape of the data requested.
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteItem(p, args, ctx, info) {
    const where = { id: args.id };
    // find the item
    const item = ctx.db.query.item({ where }, `{ id title }`);
    // check if they own or have perms
    // TODO
    // delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
};

module.exports = Mutations;
