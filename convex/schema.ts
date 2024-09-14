import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),
  users: defineTable({
    // userId: v.id("messages"),        
    correctAnswers: v.number(), 
    incorrectAnswers: v.number(), 
  })
});
