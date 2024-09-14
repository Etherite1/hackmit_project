import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const messages = await ctx.db.query("messages").order("desc").take(100);
    // Reverse the list so that it's in a chronological order.
    return messages.reverse();
  },
});

export const list_accuracy = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const messages = await ctx.db.query("users").order("desc").take(100);
    // Reverse the list so that it's in a chronological order.
    return messages.reverse();
  },
});


export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body, author }) => {
    // Send a new message.
    await ctx.db.insert("messages", { body, author });
  },
});
export const updateCorrect = mutation({
  handler: async (ctx) => {
    // Query the first (and only) user
    const user = await ctx.db.query("users").first();

    if (user) {
      await ctx.db.patch(user._id, {
        correctAnswers: user.correctAnswers + 1,
      });
    } else {
      await ctx.db.insert("users", {
        correctAnswers: 1,
        incorrectAnswers: 0, 
      });
    }
  },
});
export const updateIncorrect = mutation({
  handler: async (ctx) => {
    // Query the first (and only) user
    const user = await ctx.db.query("users").first();

    if (user) {
      await ctx.db.patch(user._id, {
        incorrectAnswers: user.incorrectAnswers + 1,
      });
    } else {
      await ctx.db.insert("users", {
        correctAnswers: 0,
        incorrectAnswers: 1, 
      });
    }
  },
});

