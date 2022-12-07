import { IListing, Listing } from "../database/models/listing.model";
import { CreateListingRequest, UpdateListingRequest } from "./listing.dto";

export class ListingsService {
  static async findAll(): Promise<IListing[]> {
    return Listing.findAll();
  }

  static async findOne(id: string): Promise<IListing | null> {
    return Listing.findOne({ where: { listingId: id } });
  }

  static async update(id: string, data: UpdateListingRequest): Promise<IListing | null> {
    const foundListing = await Listing.findOne({ where: { listingId: id } });
    if (!foundListing) {
      return null;
    }
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        foundListing[key] = data[key];
      }
    }
    return await foundListing.save();
  }

  static async create(data: CreateListingRequest): Promise<IListing> {
    return await Listing.create({ ...data });
  }

  static async delete(listingId: string): Promise<number> {
    return await Listing.destroy({ where: { listingId } });
  }
}
