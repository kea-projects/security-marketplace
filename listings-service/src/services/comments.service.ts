import { Comment, IComment } from "../database/models/comment.model";

export class CommentsService {
  static async findByListingId(id: string): Promise<IComment[]> {
    return Comment.findAll({ where: { commentedOn: id } });
  }
}
