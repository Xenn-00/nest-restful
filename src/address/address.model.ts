export type AddressResponse = {
  id: string;
  contact_id: string;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postal_code: string;
};

export type CreateAddressRequest = {
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postal_code: string;
};

export type UpdateAddressRequest = {
  street?: string;
  city?: string;
  province?: string;
  country?: string;
  postal_code?: string;
};
