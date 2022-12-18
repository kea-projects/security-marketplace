import { Comment, IComment } from "../database/models/comment.model";
import { CreateCommentRequest } from "../interfaces";

export class CommentsService {
  /**
   * Query the database to get all comment by its the listing they were commented on.
   * @param id the listing id.
   * @returns a promise of a list of comments.
   */
  static async findByListingId(id: string): Promise<IComment[]> {
    return Comment.findAll({ where: { commentedOn: id } });
  }

  /**
   * Query the database to create a new comment entity.
   * @param params the comment information.
   * @returns a promise of the created comment.
   */
  static async create(params: CreateCommentRequest): Promise<IComment> {
    return Comment.create({ ...params });
  }
}
