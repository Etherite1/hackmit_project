import { query, mutation, internalQuery } from "./_generated/server";
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

export const uuid_list = query({
  args: {},
  handler: async (ctx) => {
    const uuidDoc = await ctx.db.query("uuids").first();
    return uuidDoc?.uuid_list || [];
  },
});

// Add a mutation to update the uuid_list
export const updateUuidList = mutation({
  args: { uuids: v.array(v.string()) },
  handler: async (ctx, { uuids }) => {
    const allIds = await getAllIds(ctx, {});
    for (const id of allIds) {
      await ctx.db.delete(id);
    }
    await ctx.db.insert("uuids", { uuid_list: uuids });
  },
});

export const solvedList = query({
  args: {},
  handler: async (ctx) => {
    const solvedDoc = await ctx.db.query("solved").first();
    return solvedDoc?.solved_list || [];
  },
});

// Updated mutation to append an item to the solved list
export const updateSolvedList = mutation({
  args: { uuid: v.string() },
  handler: async (ctx, { uuid }) => {
    const solvedDoc = await ctx.db.query("solved").first();
    
    if (solvedDoc) {
      // Append the new UUID to the existing list
      await ctx.db.patch(solvedDoc._id, {
        solved_list: [...solvedDoc.solved_list, uuid]
      });
    } else {
      // If no document exists, create a new one with the UUID
      await ctx.db.insert("solved", { solved_list: [uuid] });
    }
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

// First, create a query to get all document IDs
export const getAllIds = internalQuery({
  handler: async (ctx) => {
    const allDocs = await ctx.db.query("messages").collect();
    return allDocs.map(doc => doc._id);
  },
});

// Then, create a mutation to delete all documents
export const deleteAllRecords = mutation({
  handler: async (ctx) => {
    const allIds = await getAllIds(ctx, {});
    
    for (const id of allIds) {
      await ctx.db.delete(id);
    }
    
    return `Deleted ${allIds.length} records`;
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

export const resetStats = mutation({
  handler: async (ctx) => {
    // Query the first (and only) user
    const user = await ctx.db.query("users").first();

    if (user) {
      await ctx.db.patch(user._id, {
        correctAnswers: 0,
        incorrectAnswers: 0,
      });
    } else {
      throw new Error("Unable to find user");
    }
  },
});

