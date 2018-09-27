const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

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
    const item = ctx.db.query.item({ where }, `{ id title }`); // eslint-disable-line
    // check if they own or have perms
    // TODO
    // delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(p, args, ctx, info) {
    args.email = args.email.toLowerCase();

    // hash password
    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );

    // create jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    // Finally return user
    return user;
  },
  async signin(p, { email, password }, ctx, info) {
    // 1. Check if user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No user with email: ${email}`);
    }

    // 2. Check if password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password!');
    }
    // 3. Generate the JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    // 5. Return the user
    return user;
  },
  signout(p, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  async requestReset(p, args, ctx, info) {
    // 1. Check if user is real
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error('No such user found for email ' + args.email);
    }
    // 2. Set a reset token and expiry on that user
    const resetToken = (await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = (Date.now() + 3600000).toString(); // 1 hour from now
    await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    return { message: 'Thanks!' };
    // 3. Email them the reset token
  },
  async resetPassword(p, args, ctx, info) {
    // 1. Check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Your dang passwords don't match");
    }
    // 2. Check if it’s a legit reset token

    // 3. Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: (Date.now() - 3600000).toString(),
      },
    });

    if (!user) {
      throw new Error('This token is either invalid or expired.');
    }
    // 4. Hash the new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old reset token fields
    const updatedUser = ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // 6. Generate JWT and Set Cookie
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // 7. Return the new user
    return updatedUser;
  },
};

module.exports = Mutations;
