import type { Like } from "#shared/db/schema/users";

import { posts } from "#shared/db/schema/posts";
import { likes } from "#shared/db/schema/users";
import { createLikeInputSchema } from "#shared/models/db/post/CreateLikeInput";
import { deleteLikeInputSchema } from "#shared/models/db/post/DeleteLikeInput";
import { updateLikeInputSchema } from "#shared/models/db/post/UpdateLikeInput";
import { ranking } from "@@/server/services/post/ranking";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { and, eq } from "drizzle-orm";

export const likeRouter = router({
  createLike: authedProcedure.input(createLikeInputSchema).mutation<Like | null>(async ({ ctx, input }) => {
    const post = await ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input.postId) });
    if (!post) return null;

    return ctx.db.transaction(async (tx) => {
      const newLike = (
        await tx
          .insert(likes)
          .values({ ...input, userId: ctx.session.user.id })
          .returning()
      ).find(Boolean);
      if (!newLike) return null;

      const noLikesNew = post.noLikes + newLike.value;
      await tx
        .update(posts)
        .set({
          noLikes: noLikesNew,
          ranking: ranking(noLikesNew, post.createdAt),
        })
        .where(eq(posts.id, post.id));
      return newLike;
    });
  }),
  deleteLike: authedProcedure.input(deleteLikeInputSchema).mutation<Like | null>(async ({ ctx, input }) => {
    const post = await ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, input) });
    if (!post) return null;

    return ctx.db.transaction(async (tx) => {
      const deletedLike = (
        await tx
          .delete(likes)
          .where(and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, input)))
          .returning()
      ).find(Boolean);
      if (!deletedLike) return null;

      const noLikesNew = post.noLikes - deletedLike.value;
      await tx
        .update(posts)
        .set({
          noLikes: noLikesNew,
          ranking: ranking(noLikesNew, post.createdAt),
        })
        .where(eq(posts.id, input));
      return deletedLike;
    });
  }),
  updateLike: authedProcedure
    .input(updateLikeInputSchema)
    .mutation<Like | null>(async ({ ctx, input: { postId, ...rest } }) => {
      const [post, like] = await Promise.all([
        ctx.db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, postId) }),
        ctx.db.query.likes.findFirst({
          where: (likes, { and, eq }) => and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, postId)),
        }),
      ]);
      if (!post || !like || like.value === rest.value) return null;

      const noLikesNew = post.noLikes + rest.value * 2;

      return ctx.db.transaction(async (tx) => {
        const updatedLike = (
          await tx
            .update(likes)
            .set(rest)
            .where(and(eq(likes.userId, ctx.session.user.id), eq(likes.postId, postId)))
            .returning()
        ).find(Boolean);
        if (!updatedLike) return null;

        await tx
          .update(posts)
          .set({
            noLikes: noLikesNew,
            ranking: ranking(noLikesNew, post.createdAt),
          })
          .where(eq(posts.id, postId));
        return updatedLike;
      });
    }),
});
