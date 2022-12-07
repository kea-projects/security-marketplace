export class UpdateListingRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  createdBy?: string;
}

export class CreateListingRequest {
  name!: string;
  description!: string;
  imageUrl!: string;
  createdBy!: string;
}
