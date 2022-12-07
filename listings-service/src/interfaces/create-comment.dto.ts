// I could fetch a lot of this data from the user service, but that's increasing coupling for minimal benefit. More data it is
export class CreateCommentRequest {
  name!: string;
  email!: string;
  comment!: string;
  commentedOn!: string;
}
