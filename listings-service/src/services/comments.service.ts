import { Comment, IComment } from "../database/models/comment.model";
import { CreateCommentRequest } from "../interfaces/create-comment.dto";

export class CommentsService {
  static async findByListingId(id: string): Promise<IComment[]> {
    return Comment.findAll({ where: { commentedOn: id } });
  }

  static async create(params: CreateCommentRequest): Promise<IComment> {
    return Comment.create({ ...params });
  }
}
