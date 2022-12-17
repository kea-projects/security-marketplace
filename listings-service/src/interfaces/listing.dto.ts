export class UpdateListingRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  createdBy?: string;
  isPublic?: boolean;
}

export class CreateListingRequest {
  name!: string;
  description!: string;
  imageUrl!: string;
  createdBy!: string;
  isPublic!: boolean;
}
