import { IListing, Listing } from "../database/models/listing.model";

export class ListingsService {
  static async findAll(): Promise<IListing[]> {
    return Listing.findAll();
  }
}
