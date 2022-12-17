import { Op } from "sequelize";
import { IListing, Listing } from "../database/models/listing.model";
import { UpdateListingRequest } from "../interfaces";

export class ListingsService {
  /**
   * Query the database to get all listing entities.
   * @returns a promise of a list of the listings.
   */
  static async findAll(): Promise<IListing[]> {
    return Listing.findAll();
  }
  /**
   *
   * Query the database to get all listing entities by the user who created them or that are public.
   * @param createdBy the userId of the creator user.
   * @returns a promise of a list of the listings.
   */
  static async findByCreatedByOrPublic(createdBy: string): Promise<IListing[]> {
    return Listing.findAll({ where: { [Op.or]: [{ createdBy }, { isPublic: true }] } });
  }

  /**
   * Query the database to get all public listing entities.
   * @returns a promise of a list of the listings.
   */
  static async findByIsPublic(): Promise<IListing[]> {
    return Listing.findAll({ where: { isPublic: true } });
  }

  /**
   * Query the database to get a specific listing by its id.
   * @param id the listing id.
   * @returns a promise of the listing entity or null.
   */
  static async findOne(id: string): Promise<IListing | null> {
    return Listing.findOne({ where: { listingId: id } });
  }

  /**
   * Query the database to update the listing.
   * @param id the listing id.
   * @param data the listing data to update.
   * @returns a promise of the updated listing or null.
   */
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

  /**
   * Query the database to create a new listing entity.
   * @param data the listing data
   * @returns a promise of the created listing.
   */
  static async create(data: IListing): Promise<IListing> {
    return await Listing.create({ ...data });
  }

  /**
   * Query the database to delete a specific listing.
   * @param listingId the listing id.
   * @returns a promise of the amount of database rows affected. 0 means nothing got deleted, more than 1 means that extra listings got deleted.
   */
  static async delete(listingId: string): Promise<number> {
    return await Listing.destroy({ where: { listingId } });
  }
}
